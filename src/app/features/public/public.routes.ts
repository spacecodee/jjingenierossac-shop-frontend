import { Routes } from '@angular/router';

export const publicRoutes: Routes = [
  {
    path: '',
    redirectTo: 'services',
    pathMatch: 'full',
  },
  {
    path: 'services',
    title: 'Servicios - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/public/ui/service/public-service-list/public-service-list').then((m) => m.PublicServiceList),
  },
];
