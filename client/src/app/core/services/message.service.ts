import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateMessage, Message } from '../../shared/models/message';
import { CloudinaryFile } from '../../shared/models/file';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  public sendMessage(message: CreateMessage) {
    return this.http.post<Message>(`${this.baseUrl}/messages`, {
      recipientUsername: message.recipientUsername, 
      content: message.content,
      fileUrls: message.fileUrls
    });
  }

  public deleteMessage(messageId: string) {
    return this.http.delete<boolean>(`${this.baseUrl}/messages/${messageId}`);
  }

  public editMessage(messageId: string, content: string) {
    return this.http.put<Message>(`${this.baseUrl}/messages/${messageId}`, {content});
  }

  public uploadFiles(files: File[]) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<CloudinaryFile[]>(`${this.baseUrl}/files/upload`, formData);
  }
}
