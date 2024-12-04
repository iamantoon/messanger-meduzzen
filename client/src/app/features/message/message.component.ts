import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MessageService } from '../../core/services/message.service';
import { DatePipe, NgClass } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Message } from '../../shared/models/message';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { SnackbarService } from '../../core/services/snackbar.service';
import { MatMenu, MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    DatePipe,
    MatIcon,
    FormsModule,
    MatTooltip,
    MatButton,
    MatMenu,
    MatButtonModule, 
    MatMenuModule,
    NgClass
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input({required: true}) message?: Message;
  @Output() deleteMessageFromChat = new EventEmitter();
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);
  public authService = inject(AuthService);
  private snackbar = inject(SnackbarService);
  public isEditing = false;
  public editedContent = '';
  public contextMenuVisible = false;

  public startEdit(): void {
    if (!this.message) return;

    this.isEditing = true;
    this.editedContent = this.message.content;
    this.closeContextMenu();
  }

  public saveEdit(): void {
    if (!this.message) return;

    this.messageService.editMessage(this.message.id, this.editedContent).subscribe({
      next: updatedMessage => {
        this.message!.content = updatedMessage.content;
        this.message!.edited = true;
        this.isEditing = false;
        this.chatService.getChats('').subscribe();
      }
    });
  }

  public cancelEdit(): void {
    this.isEditing = false;
  }

  public deleteMessage(): void {
    if (!this.message) return;

    this.messageService.deleteMessage(this.message.id).subscribe({
      next: () => {
        this.deleteMessageFromChat.emit(this.message!.id);
        this.chatService.getChats('').subscribe();
      }
    })
    this.closeContextMenu();
  }

  private closeContextMenu(): void {
    this.contextMenuVisible = false;
  }

  public isImage(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  }

  public getFileIcon(url: string): string {
    const extension = url.split('.').pop()!.toLowerCase();
    const fileTypeIcons: Record<string, string> = {
      pdf: 'picture_as_pdf',
      zip: 'folder',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      mp4: 'movie',
      webm: 'movie',
      avi: 'movie',
      mp3: 'music_note',
      wav: 'music_note',
      default: 'insert_drive_file',
    };
    return fileTypeIcons[extension] || fileTypeIcons['default'];
  }  

  public extractFileName(url: string): string {
    return url.split('/').pop() || 'Unknown file';
  }

  public extractFileExtension(url: string): string {
    const formatMatch = url.match(/\.(\w+)$/);
    return formatMatch ? formatMatch[1].toUpperCase() : 'Unknown';
  }

  get isAllowedToEditOrDelete(): boolean {
    return this.message?.senderId === this.authService.currentUser()?.user.id;
  }

  public copyContent(content: string): void {
    navigator.clipboard.writeText(content).then(() => {
      this.snackbar.success('Copied');
    });
  }

  get senderLabel(): string {
    return this.authService.currentUser()?.user?.id === this.message?.senderId 
      ? 'You' : this.message?.sender.firstName + ' ' + this.message?.sender.lastName + ' ' 
      + `(@${this.message?.sender.username})`;
  }
}
