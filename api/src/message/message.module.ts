import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
  imports: [UserModule, AuthModule]
})
export class MessageModule {}
