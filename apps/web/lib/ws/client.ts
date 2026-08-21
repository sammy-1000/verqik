"use client";

import { io, type Socket } from "socket.io-client";
import { AppError, isAppErrorBody } from "@/lib/errors/app-error";
import { PushEvents, type WsEvent } from "./events";
import type { RpcResponse } from "./types";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";

type PushHandler = (payload: unknown) => void;

class WsClient {
  private socket: Socket | null = null;
  private pending = new Map<
    string,
    { resolve: (v: unknown) => void; reject: (e: Error) => void }
  >();
  private pushHandlers = new Map<string, Set<PushHandler>>();
  private token: string | null = null;
  private authenticated = false;

  connect(token?: string | null): Socket {
    if (token !== undefined) {
      this.token = token;
      this.authenticated = false;
    }

    if (this.socket?.connected) {
      this.socket.auth = this.token ? { token: this.token } : {};
      return this.socket;
    }

    this.socket = io(WS_URL, {
      transports: ["websocket"],
      auth: this.token ? { token: this.token } : undefined,
      autoConnect: true,
    });

    this.socket.on(PushEvents.RPC_RESULT, (msg: RpcResponse) => {
      const pending = this.pending.get(msg.id);
      if (!pending) return;
      this.pending.delete(msg.id);
      if (msg.ok) pending.resolve(msg.data);
      else pending.reject(toAppError(msg.error));
    });

    this.socket.on(PushEvents.RPC_ERROR, (msg: RpcResponse) => {
      if (!msg.ok) {
        const pending = this.pending.get(msg.id);
        if (pending) {
          this.pending.delete(msg.id);
          pending.reject(toAppError(msg.error));
        }
      }
    });

    for (const event of Object.values(PushEvents)) {
      this.socket.on(event, (payload: unknown) => {
        if (event === PushEvents.CONNECTED) {
          const msg = payload as { authenticated?: boolean };
          this.authenticated = Boolean(msg.authenticated);
        }
        this.pushHandlers.get(event)?.forEach((h) => h(payload));
      });
    }

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.pending.clear();
    this.authenticated = false;
  }

  setToken(token: string | null) {
    this.token = token;
    this.authenticated = false;
    if (this.socket) {
      this.socket.auth = token ? { token } : {};
      if (this.socket.connected) {
        this.socket.disconnect();
        this.socket.connect();
      }
    }
  }

  on(event: string, handler: PushHandler) {
    if (!this.pushHandlers.has(event)) {
      this.pushHandlers.set(event, new Set());
    }
    this.pushHandlers.get(event)!.add(handler);
    return () => this.pushHandlers.get(event)?.delete(handler);
  }

  private waitForAuthenticated(socket: Socket): Promise<void> {
    if (!this.token) return Promise.resolve();
    if (this.authenticated) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.off(PushEvents.CONNECTED, onConnected);
        reject(new Error("Authentication timeout"));
      }, 10_000);

      const onConnected = (msg: { authenticated?: boolean }) => {
        if (msg.authenticated) {
          clearTimeout(timeout);
          socket.off(PushEvents.CONNECTED, onConnected);
          this.authenticated = true;
          resolve();
        }
      };

      socket.on(PushEvents.CONNECTED, onConnected);

      if (socket.connected) {
        socket.disconnect();
        socket.connect();
      }
    });
  }

  rpc<T = unknown>(
    event: WsEvent | string,
    payload: Record<string, unknown> = {},
  ): Promise<T> {
    const socket = this.connect(this.token);
    const id = crypto.randomUUID();

    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("Request timed out"));
      }, 30_000);

      this.pending.set(id, {
        resolve: (v) => {
          clearTimeout(timeout);
          resolve(v as T);
        },
        reject: (e) => {
          clearTimeout(timeout);
          reject(e);
        },
      });

      const send = async () => {
        try {
          if (this.token) {
            await this.waitForAuthenticated(socket);
          }
          socket.emit("rpc", { id, event, payload });
        } catch (err) {
          this.pending.delete(id);
          clearTimeout(timeout);
          reject(err instanceof Error ? err : new Error("Request failed"));
        }
      };

      if (socket.connected) void send();
      else socket.once("connect", () => void send());
    });
  }
}

export const wsClient = new WsClient();

function toAppError(error: unknown): AppError {
  if (isAppErrorBody(error)) {
    return new AppError(error);
  }

  const legacy = error as { message?: string; status?: number };
  return new AppError({
    userMessage: legacy.message ?? "Something went wrong. Please try again.",
    errorMessage: legacy.message ?? "Unknown RPC error",
    status: legacy.status ?? 500,
  });
}
