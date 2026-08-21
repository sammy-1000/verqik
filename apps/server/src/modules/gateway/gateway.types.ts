import type { AuthUser } from '@verqik/common';
import type { AppErrorBody } from '@verqik/common';

export interface WsAuthUser extends AuthUser {
  socketId: string;
}

export interface RpcRequest<T = Record<string, unknown>> {
  id: string;
  event: string;
  payload?: T;
}

export interface RpcSuccess<T = unknown> {
  id: string;
  ok: true;
  data: T;
}

export interface RpcFailure {
  id: string;
  ok: false;
  error: AppErrorBody;
}

export type RpcResponse<T = unknown> = RpcSuccess<T> | RpcFailure;

export interface RoomJoinPayload {
  type: 'delivery' | 'journey';
  id: string;
}
