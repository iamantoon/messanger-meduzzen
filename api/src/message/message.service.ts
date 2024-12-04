import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dtos/create-message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  public async addMessage(dto: CreateMessageDto, senderId: string) {
    const { recipientUsername, content, fileUrls } = dto;
  
    const recipient = await this.prisma.user.findUnique({
      where: { username: recipientUsername },
    });
  
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }
  
    let chat = await this.prisma.chat.findFirst({
      where: {
        participants: {
          every: { id: { in: [senderId, recipient.id] } },
        },
      },
    });
  
    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          participants: {
            connect: [{ id: senderId }, { id: recipient.id }],
          },
        },
      });
    }

    const message = await this.prisma.message.create({
      data: {
        senderId,
        recipientId: recipient.id,
        chatId: chat.id,
        content,
        fileUrls: fileUrls || [],
      },
    });

    await this.prisma.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });
  
    return message;
  }

  async editMessage(messageId: string, content: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
  
    if (!message) {
      throw new NotFoundException('Message not found');
    }
  
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }
  
    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        edited: true,
      },
    });
  }

  public async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });
  
    if (!message) {
      throw new NotFoundException('Message not found');
    }
  
    if (message.senderId !== userId && message.recipientId !== userId) {
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
  
    return true;
  }
}
