import { Routes } from '@angular/router';

export const routes: Routes = [
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
];
