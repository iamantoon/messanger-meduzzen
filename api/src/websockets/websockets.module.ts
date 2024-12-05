import { Module } from '@nestjs/common';
import { PresenceGateway } from './hubs/presence/presence.gateway';
import { MessagesGateway } from './hubs/messages/messages.gateway';
import { WebSocketAdapter } from './websockets.adapter';

@Module({
  providers: [PresenceGateway, MessagesGateway, WebSocketAdapter],
  exports: [PresenceGateway, MessagesGateway, WebSocketAdapter]
})
export class WebsocketsModule {}
