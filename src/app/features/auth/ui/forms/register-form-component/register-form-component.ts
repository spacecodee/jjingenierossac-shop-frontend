import { Component, computed, inject, signal } from '@angular/core';
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
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';

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
  ],
  providers: [provideIcons({ lucideEye, lucideEyeOff })],
  templateUrl: './register-form-component.html',
  styleUrl: './register-form-component.css',
})
export class RegisterFormComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly fieldErrors = signal<Record<string, string>>({});

  registerForm = new FormGroup(
    {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_.]+$/),
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
      phoneNumber: new FormControl('', [Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{9,15}$/)]),
    },
    { validators: passwordMatchValidator('password', 'confirmPassword') }
  );

  readonly passwordControl = this.registerForm.get('password');
  readonly confirmPasswordControl = this.registerForm.get('confirmPassword');

  readonly showPassword = signal<boolean>(false);
  readonly showConfirmPassword = signal<boolean>(false);

  readonly passwordsMatch = computed(() => {
    const password = this.passwordControl?.value;
    const confirmPassword = this.confirmPasswordControl?.value;

    if (!password || !confirmPassword) return null;
    if (!this.confirmPasswordControl?.touched) return null;

    return password === confirmPassword;
  });

  readonly passwordStrength = computed(() => {
    const password = this.passwordControl?.value || '';
    if (!password) return { level: 'none', label: '', percentage: 0 };

    const errors = this.passwordControl?.errors?.['strongPassword'];
    if (!errors) return { level: 'strong', label: 'Fuerte', percentage: 100 };

    const checks = [
      errors.hasMinLength,
      errors.hasUpperCase,
      errors.hasLowerCase,
      errors.hasNumber,
      errors.hasSpecialChar,
    ];
    const passed = checks.filter(Boolean).length;
    const percentage = (passed / 5) * 100;

    if (percentage <= 40) return { level: 'weak', label: 'Débil', percentage };
    if (percentage <= 80) return { level: 'medium', label: 'Media', percentage };
    return { level: 'strong', label: 'Fuerte', percentage };
  });

  readonly passwordRequirements = computed(() => {
    const errors = this.passwordControl?.errors?.['strongPassword'];
    if (!errors) {
      return {
        minLength: true,
        upperCase: true,
        lowerCase: true,
        number: true,
        specialChar: true,
      };
    }
    return {
      minLength: !errors.hasMinLength,
      upperCase: !errors.hasUpperCase,
      lowerCase: !errors.hasLowerCase,
      number: !errors.hasNumber,
      specialChar: !errors.hasSpecialChar,
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
    this.errorMessage.set(null);
    this.successMessage.set(null);
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
        this.successMessage.set(
          response.data.message ||
          'Registro exitoso. Por favor, verifica tu correo electrónico para activar tu cuenta.'
        );
        this.router.navigate(['/auth/account/login']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Error al registrar usuario');
        this.parseFieldErrors(error.backendMessage);
      },
    });
  }

  private parseFieldErrors(backendMessage: string): void {
    const errors: Record<string, string> = {};

    if (backendMessage.toLowerCase().includes('username')) {
      errors['username'] = 'El nombre de usuario ya está en uso. Por favor, elige otro.';
    }
    if (backendMessage.toLowerCase().includes('email')) {
      errors['email'] = 'Este correo electrónico ya está registrado.';
    }

    this.fieldErrors.set(errors);
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
      if (fieldName === 'username') return `Solo letras, números, punto y guión bajo`;
      if (fieldName === 'phoneNumber') return `Formato inválido. Ejemplo: +51 999 999 999`;
    }
    if (errors['passwordMismatch']) return `Las contraseñas no coinciden`;

    return null;
  }
}
