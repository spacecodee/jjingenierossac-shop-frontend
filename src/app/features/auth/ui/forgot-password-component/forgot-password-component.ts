import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ForgotPasswordRequest } from '@features/auth/data/models/forgot-password-request.interface';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    HlmInputImports,
    HlmButtonImports,
    HlmLabelImports,
    HlmCardImports,
    HlmSpinner,
  ],
  templateUrl: './forgot-password-component.html',
  styleUrl: './forgot-password-component.css',
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);

  readonly isLoading = signal<boolean>(false);
  readonly emailSent = signal<boolean>(false);

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const request: ForgotPasswordRequest = {
      email: this.forgotPasswordForm.value.email!,
    };

    this.authService.forgotPassword(request).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.emailSent.set(true);
        toast.success('Correo enviado', {
          description:
            response.message ||
            'Si el correo está registrado, recibirás un enlace de recuperación.',
        });
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);
        toast.error('Error al enviar correo', {
          description:
            error.message || 'No se pudo enviar el correo. Por favor, intenta nuevamente.',
        });
      },
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.forgotPasswordForm.get(fieldName);
    if (!control || !control.touched || !control.errors) return null;

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['email']) return 'Correo electrónico inválido';

    return null;
  }
}
