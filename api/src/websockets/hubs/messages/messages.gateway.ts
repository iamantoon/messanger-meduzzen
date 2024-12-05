import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CreateMessageDto } from 'src/message/dtos/create-message.dto';
import { ChatService } from 'src/chat/chat.service';
import { Message } from '@prisma/client';

@WebSocketGateway()
@Injectable()
export class MessagesGateway  {
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

  public sendMessage(message: Message) {
    const recipientId = message.recipientId;

    this.server.to(recipientId).emit('newMessage', message);
    
    this.server.to(recipientId).emit('updateChat', { chatId: message.chatId, message });
  }

  public updateMessage(updatedMessage: Message) {
    const recipientId = updatedMessage.recipientId;

    this.server.to(recipientId).emit('updateMessage', updatedMessage);
    
    this.server.to(recipientId).emit('updateChat', { chatId: updatedMessage.chatId, updatedMessage });
  }

  public deleteMessage(message: Message) {
    const recipientId = message.recipientId;

    this.server.to(recipientId).emit('deleteMessage', message);

    this.server.to(recipientId).emit('updateChat', { chatId: message.chatId, deletedMessageId: message.id });
  }
}
