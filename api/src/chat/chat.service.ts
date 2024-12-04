import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  public async getChats(userId: string, search?: string) {
    const existingChats = await this.prisma.chat.findMany({
      where: {
        participants: { some: { id: userId } },
        ...(search && {
          OR: [
            {
              participants: {
                some: {
                  OR: [
                    { username: { contains: search, mode: 'insensitive' } },
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                  ],
                  NOT: { id: userId }
                },
              },
            },
            {
              messages: {
                some: { content: { contains: search, mode: 'insensitive' } },
              },
            },
          ],
        }),
      },
      include: {
        participants: {
          where: { NOT: { id: userId } },
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        messages: {
          take: 1,
          orderBy: { messageSent: 'desc' },
          select: {
            senderId: true,
            content: true,
            messageSent: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  
    if (existingChats.length === 0 && search) {
      const users = await this.prisma.user.findMany({
        where: {
          NOT: { id: userId },
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      });
  
      const newChats = users.map(user => ({
        id: `new-chat-${user.id}`,
        updatedAt: new Date().toISOString(),
        participants: [
          {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        ],
        messages: [],
      }));
  
      return newChats;
    }
  
    return existingChats;
  }

  public async getChatById(chatId: string, userId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        participants: { some: { id: userId } },
      },
    });
  
    if (!chat) {
      throw new BadRequestException('There is no chat with this id');
    }

    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { messageSent: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
      },
    });
  }
}
