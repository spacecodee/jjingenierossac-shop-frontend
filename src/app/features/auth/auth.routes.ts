import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
  {
    path: '',
    title: 'Inicio de Sesión - J&J Ingenieros SAC',
    loadComponent: () => (import('./login/ui/login-component/login-component').then(m => m.LoginComponent)),
  }
];
