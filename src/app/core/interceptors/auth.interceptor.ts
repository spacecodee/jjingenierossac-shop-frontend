import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '@core/services/storage/storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const token = storageService.getItem<string>('auth_token');

  if (token && !req.url.includes('/auth/login')) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${ token }`,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};
