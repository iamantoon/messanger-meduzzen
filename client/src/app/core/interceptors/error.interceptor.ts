import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SnackbarService } from '../services/snackbar.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackbar = inject(SnackbarService);
  
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 400) {
        snackbar.error(err.error.message || err.message);
      }
      if (err.status === 401) {
        snackbar.error(err.error.message || err.message);
      }
      if (err.status === 404) {
        snackbar.error(err.error.message || err.message);
        router.navigateByUrl('');
      }
      if (err.status === 409) {
        snackbar.error(err.error.message || err.message);
      }
      if (err.status === 500) {
        snackbar.error(err.error.message  || err.error);
      }
      return throwError(() => err);
    })
  )
};
