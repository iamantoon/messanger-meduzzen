import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Message } from '../../shared/models/message';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket?: Socket;
  private authService = inject(AuthService);
  private chatService = inject(ChatService);
  public onlineUsers$ = new BehaviorSubject<string[]>([]);
  public newMessage$ = new Subject<Message>();
  public updatedMessage$ = new Subject<Message>();
  public deletedMessage$ = new Subject<string>();

  constructor() {
    this.connect();
  }

  private connect() {
    this.socket = io('http://localhost:3000', {
      query: { userId: this.authService.currentUser()?.user.id },
    });

    this.socket.on('onlineUsers', (users: string[]) => {
      this.onlineUsers$.next(users);
    });

    this.socket.on('newMessage', (data: Message) => {
      this.newMessage$.next(data);
    });
 
    this.socket.on('updateMessage', (updatedMessage: Message) => {
      this.updatedMessage$.next(updatedMessage);
    });

    this.socket.on('deleteMessage', (message: Message) => {
      this.deletedMessage$.next(message.id);
    });

    this.socket.on('updateChat', () => {
      this.chatService.getChats('').subscribe();
    });
  }

  public sendMessage(recipientId: string, content: string) {
    if (!this.socket) return;
    this.socket.emit('sendMessage', { recipientId, content });
  }

  public updateMessage(messageId: string, newContent: string) {
    if (!this.socket) return;
    this.socket.emit('updateMessage', { messageId, content: newContent });
  }

  public deleteMessage(messageId: string) {
    if (!this.socket) return;
    this.socket.emit('deleteMessage', { messageId });
  }
}
