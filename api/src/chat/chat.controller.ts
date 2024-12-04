import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  public async getUserChats(@Req() req: any, @Query('search') search?: string) {
    return this.chatService.getChats(req.user.id, search);
  }

  @Get(':id')
  public async getChatById(@Param('id') chatId: string, @Req() req: any) {
    return this.chatService.getChatById(chatId, req.user.id);
  }
}