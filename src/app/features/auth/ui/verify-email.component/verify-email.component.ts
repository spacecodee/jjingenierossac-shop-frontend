import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCircleCheck, lucideCircleX } from '@ng-icons/lucide';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-verify-email',
  imports: [HlmCardImports, HlmButtonImports, HlmSpinner, NgIcon],
  providers: [provideIcons({ lucideCircleCheck, lucideCircleX })],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isVerifying = signal<boolean>(true);
  readonly isSuccess = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  constructor() {
    effect(
      () => {
        const token = this.route.snapshot.queryParamMap.get('token');

        if (!token) {
          this.isVerifying.set(false);
          this.errorMessage.set('Token de verificación no proporcionado.');
          toast.error('Error de verificación', {
            description: 'No se proporcionó un token de verificación.',
          });
          return;
        }

        this.verifyEmail(token);
      },
      { allowSignalWrites: true }
    );
  }

  private verifyEmail(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.isVerifying.set(false);
        this.isSuccess.set(true);
        toast.success('Email verificado', {
          description: response.message || 'Tu correo electrónico ha sido verificado exitosamente.',
        });
      },
      error: (error: ApiErrorResponse) => {
        this.isVerifying.set(false);
        this.isSuccess.set(false);
        this.errorMessage.set(error.message || 'Error al verificar el correo electrónico.');
        toast.error('Error de verificación', {
          description: error.message || 'No se pudo verificar tu correo electrónico.',
        });
      },
    });
  }

  redirectToLogin(): void {
    this.router.navigate(['/auth/account/login']).then((r) => !r && undefined);
  }
}
