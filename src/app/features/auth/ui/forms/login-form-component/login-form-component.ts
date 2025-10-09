import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginRequest } from '@app/features/auth/data/models/login-request.interface';
import { AuthService } from '@core/services/auth/auth.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye, lucideEyeOff } from '@ng-icons/lucide';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-login-form',
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
  templateUrl: './login-form-component.html',
  styleUrl: './login-form-component.css',
})
export class LoginFormComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);

    const credentials: LoginRequest = {
      username: this.loginForm.value.username!,
      password: this.loginForm.value.password!,
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        toast.success('Inicio de sesión exitoso', {
          description: response.message || 'Redirigiendo al dashboard...',
        });
        this.router.navigate(['/dashboard']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);
        toast.error('Error al iniciar sesión', {
          description:
            error.message || 'Por favor, verifica tus credenciales e intenta nuevamente.',
        });
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }
}
