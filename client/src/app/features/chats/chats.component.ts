import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ChatComponent } from './chat/chat.component';
import { Chat } from '../../shared/models/chat';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [
    FormsModule,
    MatIcon,
    NgFor,
    ChatComponent,
    MatTooltip
  ],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.scss'
})
export class ChatsComponent implements OnInit {
  public chatService = inject(ChatService);
  public authService = inject(AuthService);
  private searchTerms = new Subject<string>();
  public activeChat: Chat | null = null;

  public ngOnInit(): void {
    this.initSearch();
    this.loadChats();
  }

  public onSearchChange(term: string): void {
    this.searchTerms.next(term.trim());
  }

  private loadChats(): void {
    this.chatService.getChats('').subscribe();
  }

  private initSearch(): void {
    this.searchTerms
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => {
          this.chatService.getChats(term).subscribe();
          return [];
        })
      )
      .subscribe();
  }

  public selectChat(chat: Chat): void {
    this.activeChat = chat;
  }

  public getCompanionFullname(chat: Chat): string {
    return chat.participants[0].firstName + ' ' + chat.participants[0].lastName;
  }

  public setActualActiveChat(event: string): void {
    const newActiveChat = this.chatService.chats().find(c => c.id === event);

    if (newActiveChat) {
      this.activeChat = newActiveChat;
    } else {
      this.activeChat = null;
    }
  }

  public getLastMessage(chat: Chat): string {
    const lastSender = chat.messages[0].senderId === this.authService.currentUser()?.user.id
    ? 'You' : chat.participants[0].firstName;
    return lastSender + ': ' + chat.messages[0].content;
  }
}
