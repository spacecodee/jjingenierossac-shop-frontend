import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('@features/auth/ui/auth-component/auth-component').then((m) => m.AuthComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        title: 'Inicio de Sesión - J&J Ingenieros SAC',
        loadComponent: () =>
          import('@features/auth/ui/forms/login-form-component/login-form-component').then(
            (m) => m.LoginFormComponent
          ),
      },
      {
        path: 'register',
        title: 'Registro - J&J Ingenieros SAC',
        loadComponent: () =>
          import('@features/auth/ui/forms/register-form-component/register-form-component').then(
            (m) => m.RegisterFormComponent
          ),
      },
    ],
  },
];
