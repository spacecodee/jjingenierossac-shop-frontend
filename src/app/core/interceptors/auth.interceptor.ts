import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '@core/services/storage/storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const token = storageService.getItem<string>('auth_token');

  const headers: Record<string, string> = {
    'X-Locale': 'es',
  };

  if (token && !req.url.includes('/auth/login')) {
    headers['Authorization'] = `Bearer ${ token }`;
  }

  const clonedRequest = req.clone({
    setHeaders: headers,
  });

  return next(clonedRequest);
};
