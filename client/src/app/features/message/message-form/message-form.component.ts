import { Component, EventEmitter, inject, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { MessageService } from '../../../core/services/message.service';
import { FormsModule, NgForm } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTooltip } from '@angular/material/tooltip';
import { CreateMessage, Message } from '../../../shared/models/message';
import { concatMap, map, tap } from 'rxjs';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-message-form',
  standalone: true,
  imports: [
    FormsModule,
    MatIcon,
    MatProgressSpinner,
    MatTooltip
  ],
  templateUrl: './message-form.component.html',
  styleUrl: './message-form.component.scss'
})
export class MessageFormComponent implements OnChanges {
  @Output() updateMessages = new EventEmitter();
  @Input({required: true}) recipientUsername?: string;
  @ViewChild('chatForm') chatForm!: NgForm;
  private snackbar = inject(SnackbarService);
  private chatService = inject(ChatService);
  private messageService = inject(MessageService);
  public selectedFiles: File[] = [];
  public messageContent = '';
  public isLoading = false;
  public messageTooLong = false;

  ngOnChanges(): void {
    if (this.chatForm?.form) {
      this.resetMessageInput();
    }
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
    if (!this.messageContent.trim() || !this.chatService.activeChat()) return;
  
    const newMessage: CreateMessage = {
      recipientUsername: this.recipientUsername!,
      content: this.messageContent.trim(),
      fileUrls
    };
  
    this.messageService.sendMessage(newMessage)
      .pipe(
        concatMap(response => {
          const newChatId = response.chatId;
  
          return this.chatService.getChats('').pipe(
            tap(() => this.setActiveChat(newChatId)),
            map(() => newChatId)
          );
        }),
        concatMap(newChatId => this.chatService.getChat(newChatId))
      )
      .subscribe({
        next: (messages) => {
          this.updateMessagesInChat(messages);
          this.resetMessageInput();
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  private setActiveChat(chatId: string): void {
    const newActiveChat = this.chatService.chats().find(c => c.id === chatId);

    if (newActiveChat) {
      this.chatService.activeChat.set(newActiveChat);
    } else {
      this.chatService.activeChat.set(null);
    }
  }

  private updateMessagesInChat(messages: Message[]) {
    this.updateMessages.emit(messages);
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

  private resetMessageInput() {
    if (!this.chatForm?.form) return;
    
    this.chatForm.form.markAsPristine();
    this.chatForm.form.markAsUntouched();
    this.messageContent = '';
    this.selectedFiles = [];
  }
}
