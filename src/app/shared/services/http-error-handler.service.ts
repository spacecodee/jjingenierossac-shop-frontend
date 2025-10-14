import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorHandlerService {

  handleError(error: HttpErrorResponse): Observable<never> {
    const apiError = this.transformError(error);
    return throwError(() => apiError);
  }

  private transformError(error: HttpErrorResponse): ApiErrorResponse {
    if (error.error && typeof error.error === 'object') {
      const apiError = error.error as ApiErrorResponse;

      return {
        timestamp: apiError.timestamp || new Date().toISOString(),
        message: apiError.message || this.getDefaultErrorMessage(error.status),
        path: apiError.path || '',
        method: apiError.method || '',
        status: apiError.status || error.status,
      };
    }

    return {
      timestamp: new Date().toISOString(),
      message: this.getDefaultErrorMessage(error.status),
      path: '',
      method: '',
      status: error.status,
    };
  }

  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 0:
        return 'No se pudo conectar al servidor';
      case 401:
        return 'No autorizado';
      case 403:
        return 'Acceso denegado';
      case 404:
        return 'Recurso no encontrado';
      case 422:
        return 'Error de validación';
      case 500:
        return 'Error interno del servidor';
      default:
        return 'Error desconocido';
    }
  }
}
