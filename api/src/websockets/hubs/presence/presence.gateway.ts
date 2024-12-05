import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesGateway } from '../messages/messages.gateway';

@WebSocketGateway()
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(MessagesGateway.name);
  private onlineUsers = new Map<string, string>();

  public handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      client.disconnect();
      this.logger.warn(`Client without userId disconnected`);
      return;
    }

    this.onlineUsers.set(userId, client.id);
    client.join(userId);

    this.logger.log(`User connected: ${userId} (${client.id})`);
    this.server.emit('onlineUsers', Array.from(this.onlineUsers.keys()));
  }

  public handleDisconnect(client: Socket) {
    const userId = Array.from(this.onlineUsers.keys()).find(
      (key) => this.onlineUsers.get(key) === client.id,
    );

    if (userId) {
      this.onlineUsers.delete(userId);
      this.logger.log(`User disconnected: ${userId} (${client.id})`);
      this.server.emit('onlineUsers', Array.from(this.onlineUsers.keys()));
    }
  }
}
