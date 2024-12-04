import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (authService.currentUser()){
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authService.currentUser()!.token}`
      }
    })
  }

  return next(req);
};
