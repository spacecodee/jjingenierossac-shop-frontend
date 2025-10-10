import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ResetPasswordRequest } from '@features/auth/data/models/reset-password-request.interface';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import {
  PasswordStrengthIndicatorComponent
} from '@shared/components/password-strength-indicator/password-strength-indicator';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import {
  passwordMatchValidator,
  strongPasswordValidator,
} from '@shared/validators/password.validators';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-reset-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    HlmInputImports,
    HlmButtonImports,
    HlmLabelImports,
    HlmCardImports,
    HlmSpinner,
    NgIcon,
    PasswordStrengthIndicatorComponent,
  ],
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  templateUrl: './reset-password-component.html',
  styleUrl: './reset-password-component.css',
})
export class ResetPasswordComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isLoading = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);
  readonly token = signal<string | null>(null);
  readonly tokenError = signal<string | null>(null);

  resetPasswordForm = new FormGroup(
    {
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        strongPasswordValidator(),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator('newPassword', 'confirmPassword') }
  );

  readonly passwordValue = toSignal(this.resetPasswordForm.get('newPassword')!.valueChanges, {
    initialValue: '',
  });

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.queryParamMap.get('token');

    if (!tokenParam) {
      this.tokenError.set('Token de restablecimiento no proporcionado.');
      toast.error('Error', {
        description: 'No se proporcionó un token de restablecimiento válido.',
      });
      return;
    }

    this.token.set(tokenParam);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    const currentToken = this.token();
    if (!currentToken) {
      toast.error('Error', {
        description: 'Token inválido. Por favor, solicita un nuevo enlace.',
      });
      return;
    }

    this.isLoading.set(true);

    const request: ResetPasswordRequest = {
      token: currentToken,
      newPassword: this.resetPasswordForm.value.newPassword!,
    };

    this.authService.resetPassword(request).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        toast.success('Contraseña restablecida', {
          description: response.message || 'Tu contraseña ha sido restablecida exitosamente.',
          duration: 3000,
        });

        setTimeout(() => {
          this.router.navigate(['/auth/account/login']).then((r) => !r && undefined);
        }, 3000);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);

        if (error.status === 400) {
          this.tokenError.set(error.message || 'El token es inválido, expiró o ya fue utilizado.');
          toast.error('Token inválido', {
            description: error.message || 'Por favor, solicita un nuevo enlace de recuperación.',
          });
        } else {
          toast.error('Error al restablecer contraseña', {
            description: error.message || 'Ocurrió un error. Por favor, intenta nuevamente.',
          });
        }
      },
    });
  }

  getFieldError(fieldName: string): string | null {
    const control = this.resetPasswordForm.get(fieldName);
    if (!control || !control.touched || !control.errors) return null;

    const errors = control.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minlength']) return `Mínimo ${ errors['minlength'].requiredLength } caracteres`;
    if (errors['passwordMismatch']) return 'Las contraseñas no coinciden';

    return null;
  }
}
