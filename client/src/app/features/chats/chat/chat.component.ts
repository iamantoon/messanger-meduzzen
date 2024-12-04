import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ChatService } from '../../../core/services/chat.service';
import { CreateMessage, Message } from '../../../shared/models/message';
import { MessageComponent } from '../../message/message.component';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MessageService } from '../../../core/services/message.service';
import { concatMap, map, tap } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    FormsModule,
    MatIcon,
    MessageComponent,
    MatProgressSpinner,
    MatTooltip
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnChanges {
  @Output() setActiveChat = new EventEmitter();
  @Input({required: true}) chatId: string = '';
  @Input({required: true}) username: string = '';
  @ViewChild('chatForm') chatForm!: NgForm;
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);
  private snackbar = inject(SnackbarService);
  public messages: Message[] = [];
  public messageContent = '';
  public selectedFiles: File[] = [];
  public isLoading = false;
  public messageTooLong = false;

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.chatId.startsWith('new')) {
      this.messages = [];
      return;
    }
    this.loadMessagesByChatId();
    if (this.chatForm?.form) {
      this.resetMessageInput();
    }
  }

  private loadMessagesByChatId(): void {
    if (!this.chatId) return;

    this.chatService.getChat(this.chatId).subscribe({
      next: messages => this.messages = messages
    });
  }

  public onSubmit(): void {
    this.isLoading = true;
    if (this.selectedFiles.length > 0) {
      this.messageService.uploadFiles(this.selectedFiles).subscribe({
        next: (uploadedFiles) => {
          const fileUrls = uploadedFiles.map(file => file.url);
          this.sendMessage(fileUrls);
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.sendMessage([]);
    }
  }

  public sendMessage(fileUrls: string[]): void {
    if (!this.messageContent.trim()) return;
  
    const newMessage: CreateMessage = {
      recipientUsername: this.username,
      content: this.messageContent.trim(),
      fileUrls
    };
  
    this.messageService.sendMessage(newMessage)
      .pipe(
        concatMap(response => {
          const newChatId = response.chatId;
  
          return this.chatService.getChats('').pipe(
            tap(() => this.setActiveChat.emit(newChatId)),
            map(() => newChatId)
          );
        }),
        concatMap(newChatId => this.chatService.getChat(newChatId))
      )
      .subscribe({
        next: (messages) => {
          this.messages = messages;
          this.resetMessageInput();
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  private resetMessageInput() {
    if (!this.chatForm?.form) return;
    
    this.chatForm.form.markAsPristine();
    this.chatForm.form.markAsUntouched();
    this.messageContent = '';
    this.selectedFiles = [];
  }

  public triggerFileUpload(): void {
    const fileInput = document.getElementById('files') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
  
    if (!input.files) return;
  
    const allowedFormats = ['jpeg', 'jpg', 'png', 'jfif', 'gif', 'mp4', 'avi', 'mp3', 'wav', 'pdf', 'webm'];
    const invalidFiles: string[] = [];
  
    const newFiles = Array.from(input.files);
  
    newFiles.forEach((file) => {
      const fileExtension = file.name.split('.').pop()!.toLowerCase();
      if (!allowedFormats.includes(fileExtension)) {
        invalidFiles.push(file.name);
      } else if (!this.selectedFiles.find((existingFile) => existingFile.name === file.name)) {
        this.selectedFiles.push(file);
      }
    });
  
    if (this.selectedFiles.length > 5) {
      this.selectedFiles = this.selectedFiles.slice(0, 5);
      this.snackbar.error('Only up to 5 files can be selected at a time');
    }
  
    if (invalidFiles.length) {
      this.snackbar.error(`The following files have invalid formats: ${invalidFiles.join(', ')}`);
    }
  }
  

  get isButtonDisabled() {
    return this.messageContent.trim().length === 0 || this.messageTooLong;
  }

  get errorMessage(): string | null {
    if (this.messageContent.trim().length === 0) {
      return 'Message cannot be empty';
    }
    if (this.messageTooLong) {
      return 'Message is too long (max 500 characters)';
    }
    return null;
  }

  public validateMessageContent(): void {
    this.messageTooLong = this.messageContent.length > 500;
  }
  
  public removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  public deleteMessage(id: string): void {
    this.messages = this.messages.filter(m => m.id !== id);
    if (this.messages.length === 0) {
      const updatedChats = this.chatService.chats().filter(c => c.id !== this.chatId);
      this.chatService.chats.set(updatedChats);
      this.setActiveChat.emit(null);
    }
  }
}
