import { Body, Controller, Delete, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  public async sendMessage(@Body() dto: CreateMessageDto, @Req() req: any) {
    const userId = req.user.id;
    return this.messageService.addMessage(dto, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  public async editMessage(
    @Param('id') messageId: string,
    @Body('content') content: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.messageService.editMessage(messageId, content, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  public async deleteMessage(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.messageService.deleteMessage(id, userId);
  }
}
