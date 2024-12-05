import { Component, inject, Input, OnChanges, OnDestroy} from '@angular/core';
import { ChatService } from '../../../core/services/chat.service';
import { Message } from '../../../shared/models/message';
import { MessageComponent } from '../../message/message.component';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../../core/services/websocket.service';
import { MessageFormComponent } from "../../message/message-form/message-form.component";
import { Chat } from '../../../shared/models/chat';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule,
    MessageComponent,
    MessageFormComponent
],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnChanges, OnDestroy {
  @Input({required: true}) activeChat: Chat | null = null;
  public chatService = inject(ChatService);
  private snackbar = inject(SnackbarService);
  private websocketService = inject(WebsocketService);
  public messages: Message[] = [];
  private subscriptions = new Subscription();

  public ngOnChanges(): void {
    if (this.activeChat?.id.startsWith('new')) {
      this.messages = [];
      return;
    }
    this.loadMessagesByChatId();
    this.subscribeToChanges();
  }

  private loadMessagesByChatId(): void {
    if (!this.activeChat) return;

    this.chatService.getChat(this.activeChat.id).subscribe({
      next: messages => this.messages = messages
    });
  }
  
  private subscribeToChanges(): void {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
  
    const newMessageSub = this.websocketService.newMessage$.subscribe({
      next: (message) => {
        if (this.activeChat!.id === message.chatId) {
          this.messages = [...this.messages, message];
        } else {
          this.snackbar.success(`You've got a new message from ${message.sender.firstName} ${message.sender.lastName}`);
        }
      },
    });

    const updateMessageSub = this.websocketService.updatedMessage$.subscribe({
      next: (updatedMessage) => {
        if (this.activeChat!.id === updatedMessage.chatId) {
          this.messages = this.messages.map((msg) =>
            msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
          );
        }
      },
    });
  
    const deleteMessageSub = this.websocketService.deletedMessage$.subscribe({
      next: (deletedMessageId) => {
        this.messages = this.messages.filter((msg) => msg.id !== deletedMessageId);
      },
    });
  
    this.subscriptions.add(newMessageSub);
    this.subscriptions.add(updateMessageSub);
    this.subscriptions.add(deleteMessageSub);
  }

  public deleteMessage(id: string): void {
    this.messages = this.messages.filter(m => m.id !== id);
    if (this.messages.length === 0) {
      const updatedChats = this.chatService.chats().filter(c => {
        return c.id !== this.activeChat!.id;
      });
      this.chatService.chats.set(updatedChats);
      this.chatService.activeChat.set(null);
    }
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
