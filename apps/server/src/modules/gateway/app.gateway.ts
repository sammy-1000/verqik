import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { GatewayPushService } from '../realtime/gateway-push.service';
import { GatewayDispatcherService } from './gateway-dispatcher.service';
import { GatewayEvents, PushEvents } from './gateway.events';
import type { RpcRequest, RoomJoinPayload, WsAuthUser } from './gateway.types';
import { WsAuthService } from './ws-auth.service';

interface AuthenticatedSocket extends Socket {
  data: {
    user?: WsAuthUser;
  };
}

const DIRECT_EVENTS = Object.values(GatewayEvents).filter(
  (e) =>
    e !== GatewayEvents.RPC &&
    e !== GatewayEvents.ROOM_JOIN &&
    e !== GatewayEvents.ROOM_LEAVE,
);

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000,
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(AppGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly wsAuth: WsAuthService,
    private readonly dispatcher: GatewayDispatcherService,
    private readonly push: GatewayPushService,
  ) {}

  afterInit(server: Server) {
    this.push.setServer(server);
    this.logger.log('Socket.IO gateway ready — use event "rpc" or direct event names');
  }

  async handleConnection(client: AuthenticatedSocket) {
    const token = this.wsAuth.extractToken({
      token: client.handshake.auth?.token as string | undefined,
      authorization: client.handshake.headers.authorization,
    });

    if (token) {
      try {
        const user = await this.wsAuth.authenticate(token);
        client.data.user = { ...user, socketId: client.id };
        await client.join(`user:${user.id}`);
      } catch (error) {
        this.logger.warn(`WS auth failed for ${client.id}`);
        client.emit(PushEvents.RPC_ERROR, {
          id: 'connection',
          ok: false,
          error: { message: 'Authentication failed', status: 401 },
        });
        client.disconnect(true);
        return;
      }
    }

    client.emit(PushEvents.CONNECTED, {
      authenticated: Boolean(client.data.user),
      socketId: client.id,
      user: client.data.user
        ? {
            id: client.data.user.id,
            email: client.data.user.email,
            permissions: client.data.user.permissions,
          }
        : undefined,
      events: DIRECT_EVENTS,
    });

    for (const event of DIRECT_EVENTS) {
      client.on(event, async (payload: RpcRequest | Record<string, unknown>, ack) => {
        const result = await this.processEvent(client, event, payload);
        if (typeof ack === 'function') ack(result);
      });
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(GatewayEvents.PING)
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit(PushEvents.PONG, {
      timestamp: new Date().toISOString(),
      userId: client.data.user?.id,
    });
  }

  /** Primary RPC envelope: { id, event, payload } */
  @SubscribeMessage(GatewayEvents.RPC)
  async handleRpc(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: RpcRequest,
  ) {
    return this.processEvent(client, body.event, body);
  }

  @SubscribeMessage(GatewayEvents.ROOM_JOIN)
  async handleRoomJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RoomJoinPayload & RpcRequest,
  ) {
    const user = client.data.user;
    if (!user) {
      return this.dispatcher.toRpcFailure(payload.id ?? 'room', {
        message: 'Authentication required',
        status: 401,
      });
    }

    try {
      const { room } = await this.dispatcher.joinRoom(user, payload);
      await client.join(room);
      return this.dispatcher.toRpcSuccess(payload.id ?? 'room', { joined: room });
    } catch (error) {
      return this.dispatcher.toRpcFailure(payload.id ?? 'room', error);
    }
  }

  @SubscribeMessage(GatewayEvents.ROOM_LEAVE)
  async handleRoomLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: RoomJoinPayload,
  ) {
    const room =
      payload.type === 'delivery'
        ? `delivery:${payload.id}`
        : `journey:${payload.id}`;
    await client.leave(room);
    return { left: room };
  }

  private async processEvent(
    client: AuthenticatedSocket,
    event: string,
    body: RpcRequest | Record<string, unknown>,
  ) {
    const envelope = body as RpcRequest;
    const id =
      envelope.id ??
      `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payload = (envelope.payload ?? body) as Record<string, unknown>;

    try {
      const data = await this.dispatcher.dispatch(
        event,
        client.data.user ?? null,
        payload,
      );
      const result = this.dispatcher.toRpcSuccess(id, data);
      client.emit(PushEvents.RPC_RESULT, result);
      return result;
    } catch (error) {
      const failure = this.dispatcher.toRpcFailure(id, error);
      client.emit(PushEvents.RPC_ERROR, failure);
      return failure;
    }
  }
}
