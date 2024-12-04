import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [AuthModule]
})
export class ChatModule {}
