import { IoAdapter } from '@nestjs/platform-socket.io';
import { Injectable } from '@nestjs/common';
import { ServerOptions } from 'socket.io';

@Injectable()
export class WebSocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
    return server;
  }
}
