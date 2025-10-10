import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ForgotPasswordRequest } from '@app/features/auth/data/models/forgot-password-request.interface';
import { LoginRequest } from '@app/features/auth/data/models/login-request.interface';
import { LoginResponse } from '@app/features/auth/data/models/login-response.interface';
import { RegisterCustomerRequest } from '@app/features/auth/data/models/register-customer-request.interface';
import { RegisterCustomerResponse } from '@app/features/auth/data/models/register-customer-response.interface';
import { ResetPasswordRequest } from '@app/features/auth/data/models/reset-password-request.interface';
import { StorageService } from '@core/services/storage/storage';
import { environment } from '@environments/environment';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiErrorDataResponse } from '@shared/data/models/api-error-data-response.interface';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { ApiPlainResponse } from '@shared/data/models/api-plain-response.interface';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);

  private readonly apiUrl = `${ environment.apiUrl }/auth`;
  private readonly isAuthenticatedSignal = signal<boolean>(this.hasValidToken());
  private readonly currentTokenSignal = signal<string | null>(this.getStoredToken());

  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  login(credentials: LoginRequest): Observable<ApiDataResponse<LoginResponse>> {
    return this.http.post<ApiDataResponse<LoginResponse>>(`${ this.apiUrl }/login`, credentials).pipe(
      tap((response) => {
        if (response.data) {
          this.setAuthData(response.data);
          this.isAuthenticatedSignal.set(true);
          this.currentTokenSignal.set(response.data.token);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  register(
    request: RegisterCustomerRequest
  ): Observable<ApiDataResponse<RegisterCustomerResponse>> {
    return this.http
      .post<ApiDataResponse<RegisterCustomerResponse>>(`${ this.apiUrl }/register`, request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  verifyEmail(token: string): Observable<ApiPlainResponse> {
    return this.http
      .post<ApiPlainResponse>(`${ this.apiUrl }/verify-email`, null, {
        params: { token },
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  logout(): Observable<ApiPlainResponse> {
    return this.http.post<ApiPlainResponse>(`${ this.apiUrl }/logout`, null).pipe(
      tap(() => {
        this.clearAuthData();
        this.isAuthenticatedSignal.set(false);
        this.currentTokenSignal.set(null);
      }),
      catchError((error: HttpErrorResponse) => {
        this.clearAuthData();
        this.isAuthenticatedSignal.set(false);
        this.currentTokenSignal.set(null);
        return throwError(() => this.handleError(error));
      })
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ApiPlainResponse> {
    return this.http.post<ApiPlainResponse>(`${ this.apiUrl }/forgot-password`, request).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<ApiPlainResponse> {
    return this.http.post<ApiPlainResponse>(`${ this.apiUrl }/reset-password`, request).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  private setAuthData(loginResponse: LoginResponse): void {
    this.storageService.setItem('auth_token', loginResponse.token);
    this.storageService.setItem('auth_expiry', loginResponse.expiryDate);
    this.storageService.setItem('auth_username', loginResponse.username);
    this.storageService.setItem('auth_role', loginResponse.roleName);
  }

  private clearAuthData(): void {
    this.storageService.removeItem('auth_token');
    this.storageService.removeItem('auth_expiry');
    this.storageService.removeItem('auth_username');
    this.storageService.removeItem('auth_role');
  }

  private getStoredToken(): string | null {
    return this.storageService.getItem<string>('auth_token');
  }

  private hasValidToken(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    const expiryString = this.storageService.getItem<string>('auth_expiry');
    if (!expiryString) return false;

    try {
      const expiryDate = new Date(expiryString);
      return expiryDate > new Date();
    } catch {
      return false;
    }
  }

  private handleError(
    error: HttpErrorResponse
  ): ApiErrorResponse | ApiErrorDataResponse<Record<string, string>> {
    if (error.error && typeof error.error === 'object') {
      const apiError = error.error as
        | ApiErrorResponse
        | ApiErrorDataResponse<Record<string, string>>;

      const baseError = {
        timestamp: apiError.timestamp || new Date().toISOString(),
        backendMessage: apiError.backendMessage || 'Error del servidor',
        message: apiError.message || this.getDefaultErrorMessage(error.status),
        path: apiError.path || '',
        method: apiError.method || '',
        status: apiError.status || error.status,
      };

      if ('data' in apiError && apiError.data) {
        return {
          ...baseError,
          data: apiError.data,
        } as ApiErrorDataResponse<Record<string, string>>;
      }

      return baseError;
    }

    return {
      timestamp: new Date().toISOString(),
      backendMessage: 'Error de conexión',
      message: this.getDefaultErrorMessage(error.status),
      path: '',
      method: '',
      status: error.status,
    };
  }

  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 401:
        return 'Credenciales inválidas. Por favor, verifica tu usuario y contraseña.';
      case 409:
        return 'El nombre de usuario o correo electrónico ya está registrado.';
      case 422:
        return 'Error de validación. Verifica que todos los campos estén correctos.';
      case 423:
        return 'Cuenta bloqueada debido a múltiples intentos fallidos. Intenta más tarde.';
      case 0:
        return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      default:
        return 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
    }
  }
}
