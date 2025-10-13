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
      import('@features/public/ui/public-service-list/public-service-list').then(
        (m) => m.PublicServiceList
      ),
  },
  {
    path: 'services/:id',
    title: 'Detalle del Servicio - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/public/ui/public-service-detail/public-service-detail').then(
        (m) => m.PublicServiceDetail
      ),
  },
];
