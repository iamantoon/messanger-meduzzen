import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../../shared/models/user';
import { Login, Register } from '../../shared/models/auth';
import { map } from 'rxjs';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private chatService = inject(ChatService);
  private baseUrl = 'http://localhost:3000/api/auth/';
  public currentUser = signal<User | null>(null);

  public login(model: Login) {
    return this.http.post<User>(this.baseUrl + 'login', model).pipe(
      map(user => {
        if (user) this.setCurrentUser(user);
        return user;
      })
    );
  }

  public register(model: Register) {
    return this.http.post<User>(this.baseUrl + 'register', model);
  }

  public setCurrentUser(user: User) {
    this.currentUser.set(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  public logout() {
    this.currentUser.set(null);
    this.router.navigateByUrl('/login');
    this.chatService.chats.set([]);
    this.chatService.activeChat.set(null);
    localStorage.removeItem('user');
  }
}
