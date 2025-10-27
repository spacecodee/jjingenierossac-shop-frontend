import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpParamsBuilderService {
  buildSearchParams(params: Record<string, unknown> | object): HttpParams {
    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            httpParams = httpParams.set(key, value.join(','));
          }
        } else if (typeof value === 'boolean' || typeof value === 'number') {
          httpParams = httpParams.set(key, value.toString());
        } else if (typeof value === 'string' && value.trim() !== '') {
          httpParams = httpParams.set(key, value);
        }
      }
    }

    return httpParams;
  }
}
