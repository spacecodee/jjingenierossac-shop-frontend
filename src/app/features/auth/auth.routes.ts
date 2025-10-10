import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'account/login',
    pathMatch: 'full',
  },
  {
    path: 'account',
    loadComponent: () => import('./ui/auth-component/auth-component').then((m) => m.AuthComponent),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        title: 'Inicio de Sesión - J&J Ingenieros SAC',
        loadComponent: () =>
          import('./ui/forms/login-form-component/login-form-component').then(
            (m) => m.LoginFormComponent
          ),
      },
      {
        path: 'register',
        title: 'Registro - J&J Ingenieros SAC',
        loadComponent: () =>
          import('./ui/forms/register-form-component/register-form-component').then(
            (m) => m.RegisterFormComponent
          ),
      },
    ],
  },
  {
    path: 'forgot-password',
    title: 'Recuperar Contraseña - J&J Ingenieros SAC',
    loadComponent: () =>
      import('./ui/forgot-password-component/forgot-password-component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'verify-email',
    title: 'Verificar Correo - J&J Ingenieros SAC',
    loadComponent: () =>
      import('./ui/verify-email.component/verify-email.component').then(
        (m) => m.VerifyEmailComponent
      ),
  },
  {
    path: 'reset-password',
    title: 'Restablecer Contraseña - J&J Ingenieros SAC',
    loadComponent: () =>
      import('./ui/reset-password-component/reset-password-component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
];
