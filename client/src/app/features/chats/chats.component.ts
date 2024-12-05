import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ChatComponent } from './chat/chat.component';
import { Chat } from '../../shared/models/chat';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { MatTooltip } from '@angular/material/tooltip';
import { ChatItemComponent } from './chat-item/chat-item.component';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [
    FormsModule,
    MatIcon,
    ChatComponent,
    MatTooltip,
    ChatItemComponent
  ],
  templateUrl: './chats.component.html',
  styleUrl: './chats.component.scss'
})
export class ChatsComponent implements OnInit {
  public chatService = inject(ChatService);
  public authService = inject(AuthService);
  public onlineUsers: Set<string> = new Set<string>();
  private searchTerms = new Subject<string>();

  public ngOnInit(): void {
    this.initSearch();
    this.loadChats();
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

  public onSearchChange(term: string): void {
    this.searchTerms.next(term.trim());
  }
}
