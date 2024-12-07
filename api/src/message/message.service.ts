import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { MessagesGateway } from 'src/websockets/hubs/messages/messages.gateway';
import { Message } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService, private readonly messagesGateway: MessagesGateway) {}

  public async addMessage(dto: CreateMessageDto, senderId: string) {
    const { recipientUsername, content, fileUrls } = dto;

    const recipient = await this.findUserByUsername(recipientUsername);
    const chat = await this.findOrCreateChat(senderId, recipient.id);

    const message = await this.prisma.message.create({
      data: {
        senderId,
        recipientId: recipient.id,
        chatId: chat.id,
        content,
        fileUrls: fileUrls || [],
      },
    });

    await this.updateChatTimestamp(chat.id);

    const messageWithSender = await this.prepareMessageWithSender(message);
    this.messagesGateway.sendMessage(messageWithSender);

    return message;
  }

  public async editMessage(messageId: string, content: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }
  
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }
  
    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        edited: true,
      },
    });
  
    this.messagesGateway.updateMessage(updatedMessage);
  
    return updatedMessage;
  }

  public async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
  
    if (!message) {
      throw new NotFoundException('Message not found');
    }
  
    if (message.senderId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this message');
    }
  
    await this.prisma.message.delete({
      where: { id: messageId },
    });
  
    const remainingMessages = await this.prisma.message.count({
      where: { chatId: message.chatId },
    });
  
    if (remainingMessages === 0) {
      await this.prisma.chat.delete({
        where: { id: message.chatId },
      });
    }

    this.messagesGateway.deleteMessage(message);
  
    return true;
  }

  private async findUserByUsername(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async findOrCreateChat(senderId: string, recipientId: string) {
    let chat = await this.prisma.chat.findFirst({
      where: {
        participants: {
          every: { id: { in: [senderId, recipientId] } },
        },
      },
    });

    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          participants: {
            connect: [{ id: senderId }, { id: recipientId }],
          },
        },
      });
    }

    return chat;
  }

  private async updateChatTimestamp(chatId: string) {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });
  }

  private async prepareMessageWithSender(message: Message) {
    const sender = await this.prisma.user.findUnique({
      where: { id: message.senderId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
      },
    });

    return { ...message, sender };
  }
}
