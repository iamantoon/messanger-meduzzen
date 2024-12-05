import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Chat } from '../../../shared/models/chat';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { WebsocketService } from '../../../core/services/websocket.service';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-chat-item',
  standalone: true,
  imports: [
    MatIcon,
    MatTooltip
  ],
  templateUrl: './chat-item.component.html',
  styleUrl: './chat-item.component.scss'
})
export class ChatItemComponent implements OnInit {
  @Input({required: true}) chat?: Chat;
  private websocketService = inject(WebsocketService);
  private authService = inject(AuthService);
  public chatService = inject(ChatService);
  public onlineUsers: Set<string> = new Set<string>();

  public ngOnInit(): void {
    this.subscribeToWebSocketEvents();
  }

  private subscribeToWebSocketEvents(): void {
    this.websocketService.onlineUsers$.subscribe(users => {
      this.onlineUsers = new Set(users);
    });
  }

  get fullname(): string | undefined {
    if (!this.chat) return '';
    return this.chat.participants[0].firstName + ' ' + this.chat.participants[0].lastName;
  }

  get lastMessage(): string | undefined {
    if (!this.chat) return;
    const lastSender = this.chat.messages[0].senderId === this.authService.currentUser()?.user.id
    ? 'You' : this.chat.participants[0].firstName;
    return lastSender + ': ' + this.chat.messages[0].content;
  }

  get isOnline(): boolean {
    if (this.chat) {
      const companionId = this.chat.participants[0].id;
      return this.onlineUsers.has(companionId);
    } else {
      return false;
    }
  }

  public selectChat(): void {
    if (!this.chat) return;
    this.chatService.activeChat.set(this.chat);
  }
}
