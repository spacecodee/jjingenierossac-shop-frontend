import { Routes } from '@angular/router';
import { AuthLayout } from '@app/layout/auth-layout/auth-layout';

export const routes: Routes = [
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'auth',
  },
  {
    path: 'auth',
    component: AuthLayout,
    loadChildren: () => (import('./features/auth/auth.routes').then(m => m.routes)),
  }
];
