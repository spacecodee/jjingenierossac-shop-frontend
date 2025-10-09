import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterCustomerRequest } from '@app/features/auth/data/models/register-customer-request.interface';
import {
  passwordMatchValidator,
  strongPasswordValidator,
} from '@app/shared/validators/password.validators';
import { AuthService } from '@core/services/auth/auth.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { ApiErrorDataResponse } from '@shared/data/models/api-error-data-response.interface';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-register-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    HlmInputImports,
    HlmButtonImports,
    HlmLabelImports,
    HlmIconImports,
    NgIcon,
    HlmSpinner,
  ],
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  templateUrl: './register-form-component.html',
  styleUrl: './register-form-component.css',
})
export class RegisterFormComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal<boolean>(false);
  readonly fieldErrors = signal<Record<string, string>>({});

  registerForm = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20),
        Validators.pattern(/^[a-z0-9_]+$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        strongPasswordValidator(),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [
        Validators.pattern(/^(\+?\d{1,3})?[\s-]?(\d[\s-]?){9,14}\d$/),
      ]),
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') }
  );

  readonly passwordControl = this.registerForm.get('password');
  readonly confirmPasswordControl = this.registerForm.get('confirmPassword');

  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);

  readonly passwordValue = toSignal(this.passwordControl!.valueChanges, { initialValue: '' });
  readonly confirmPasswordValue = toSignal(this.confirmPasswordControl!.valueChanges, {
    initialValue: '',
  });

  readonly passwordsMatch = computed(() => {
    const password = this.passwordValue();
    const confirmPassword = this.confirmPasswordValue();

    if (!password || !confirmPassword) return null;
    if (!this.confirmPasswordControl?.touched) return null;

    return password === confirmPassword;
  });

  readonly passwordStrength = computed(() => {
    const password = this.passwordValue();
    if (!password) return { level: 'none', label: '', percentage: 0 };

    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password);

    const checks = [hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar];
    const passed = checks.filter(Boolean).length;
    const percentage = (passed / 5) * 100;

    if (percentage <= 40) return { level: 'weak', label: 'Débil', percentage };
    if (percentage <= 80) return { level: 'medium', label: 'Media', percentage };
    return { level: 'strong', label: 'Fuerte', percentage };
  });

  readonly passwordRequirements = computed(() => {
    const password = this.passwordValue();

    if (!password) {
      return {
        minLength: false,
        upperCase: false,
        lowerCase: false,
        number: false,
        specialChar: false,
      };
    }

    return {
      minLength: password.length >= 8,
      upperCase: /[A-Z]/.test(password),
      lowerCase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password),
    };
  });

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.fieldErrors.set({});

    const request: RegisterCustomerRequest = {
      username: this.registerForm.value.username!,
      password: this.registerForm.value.password!,
      confirmPassword: this.registerForm.value.confirmPassword!,
      firstName: this.registerForm.value.firstName!,
      lastName: this.registerForm.value.lastName!,
      email: this.registerForm.value.email!,
      phoneNumber: this.registerForm.value.phoneNumber || undefined,
    };

    this.authService.register(request).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        toast.success('Registro exitoso', {
          description:
            response.data.message ||
            'Por favor, verifica tu correo electrónico para activar tu cuenta.',
        });
        this.router.navigate(['/auth/account/login']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse | ApiErrorDataResponse<Record<string, string>>) => {
        this.isLoading.set(false);

        if (error.status === 422 && 'data' in error && error.data) {
          toast.error('Errores de validación', {
            description: error.message || 'Por favor, revisa los campos marcados en rojo.',
          });
          this.parseFieldErrors(error);
        } else {
          toast.error('Error al registrar usuario', {
            description: error.message || 'Por favor, verifica los datos e intenta nuevamente.',
          });
        }
      },
    });
  }

  private parseFieldErrors(
    error: ApiErrorResponse | ApiErrorDataResponse<Record<string, string>>
  ): void {
    if (error.status === 422 && 'data' in error && error.data) {
      this.fieldErrors.set(error.data);

      for (const fieldName of Object.keys(error.data)) {
        const control = this.registerForm.get(fieldName);
        if (control) {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      }
    } else {
      this.fieldErrors.set({});
    }
  }

  getFieldError(fieldName: string): string | null {
    const control = this.registerForm.get(fieldName);
    const fieldError = this.fieldErrors()[fieldName];

    if (fieldError) return fieldError;
    if (!control || !control.touched || !control.errors) return null;

    const errors = control.errors;

    if (errors['required']) return `Este campo es obligatorio`;
    if (errors['minlength']) return `Mínimo ${ errors['minlength'].requiredLength } caracteres`;
    if (errors['maxlength']) return `Máximo ${ errors['maxlength'].requiredLength } caracteres`;
    if (errors['email']) return `Correo electrónico inválido`;
    if (errors['pattern']) {
      if (fieldName === 'username') return `Solo letras minúsculas, números y guión bajo`;
      if (fieldName === 'phoneNumber') return `Formato inválido. Ejemplo: +51 999 999 999`;
    }
    if (errors['passwordMismatch']) return `Las contraseñas no coinciden`;

    return null;
  }
}
