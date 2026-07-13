import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { UserRole } from '../users/user.entity';
import type { JwtPayload } from '../auth/auth.service';

const SALE_ROLES = [UserRole.SALE, UserRole.AGENCY, UserRole.BANK, UserRole.ADMIN, UserRole.SUPER_ADMIN];

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN?.split(',') ?? '*' },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwt: JwtService) {}

  /** Every socket authenticates with the same JWT access token used for
   * REST calls (sent via the connection handshake, not a separate login
   * step) — verified with the same secret/signature check as the HTTP
   * JwtStrategy, so a forged/expired token can't join anyone's room. */
  handleConnection(@ConnectedSocket() client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      this.logger.warn(`Socket ${client.id} connected without a token — disconnecting`);
      client.disconnect();
      return;
    }
    try {
      const payload = this.jwt.verify<JwtPayload>(token);
      client.data.userId = payload.sub;
      client.data.role = payload.role;
      client.join(`user:${payload.sub}`);
      if (SALE_ROLES.includes(payload.role)) {
        client.join('sale-leads');
      }
    } catch {
      this.logger.warn(`Socket ${client.id} sent an invalid/expired token — disconnecting`);
      client.disconnect();
    }
  }

  handleDisconnect() {
    // Socket.io handles room cleanup automatically on disconnect.
  }

  /** Called by MessagesService right after a message is persisted. */
  notifyNewMessage(receiverId: string, payload: unknown) {
    this.server.to(`user:${receiverId}`).emit('new_message', payload);
  }

  /** Called by LeadsService right after a lead is created — every
   * connected Sale/Agency/Bank/Admin sees the marketplace update live. */
  notifyNewLead(payload: unknown) {
    this.server.to('sale-leads').emit('new_lead', payload);
  }
}
