import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Chat } from '../../shared/models/chat';
import { Message } from '../../shared/models/message';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/chats';
  public chats = signal<Chat[]>([]);
  public activeChat = signal<Chat | null>(null);

  public getChats(search: string) {
    let params = new HttpParams();
  
    if (search) {
      params = params.append('search', search);
    }
  
    return this.http.get<Chat[]>(this.baseUrl, { params }).pipe(
      tap(response => this.chats.set(response))
    );
  }
  
  public getChat(id: string) {
    return this.http.get<Message[]>(this.baseUrl + '/' + id);
  }
}
