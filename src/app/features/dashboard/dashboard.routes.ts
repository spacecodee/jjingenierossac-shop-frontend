import { Routes } from '@angular/router';

export const dashboardRoutes: Routes = [
  {
    path: '',
    redirectTo: 'overview',
    pathMatch: 'full',
  },
  {
    path: 'overview',
    title: 'Panel de Control - J&J Ingenieros SAC',
    loadComponent: () =>
      import(
        '@app/features/dashboard/ui/dashboard-overview-component/dashboard-overview-component'
        ).then((m) => m.DashboardOverviewComponent),
  },
  {
    path: 'service-categories',
    title: 'Categorías de Servicios - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/service-category/ui/service-category-list/service-category-list').then(
        (m) => m.ServiceCategoryList
      ),
  },
];
