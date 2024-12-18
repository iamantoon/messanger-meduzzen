import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './message/message.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { FileModule } from './file/file.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { WebsocketsModule } from './websockets/websockets.module';

@Module({
  imports: [
    UserModule, 
    AuthModule, 
    MessageModule, 
    PrismaModule, 
    ChatModule, 
    FileModule, 
    CloudinaryModule, 
    WebsocketsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
