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
      import(
        '@features/dashboard/ui/service-category/ui/service-category-list/service-category-list'
        ).then((m) => m.ServiceCategoryList),
  },
  {
    path: 'service-categories/create',
    title: 'Crear Categoría de Servicio - J&J Ingenieros SAC',
    loadComponent: () =>
      import(
        '@features/dashboard/ui/service-category/ui/forms/service-category-form/service-category-form'
        ).then((m) => m.ServiceCategoryForm),
  },
  {
    path: 'service-categories/:id/edit',
    title: 'Editar Categoría de Servicio - J&J Ingenieros SAC',
    loadComponent: () =>
      import(
        '@features/dashboard/ui/service-category/ui/forms/service-category-form/service-category-form'
        ).then((m) => m.ServiceCategoryForm),
  },
  {
    path: 'services',
    title: 'Servicios - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/service/ui/service-list/service-list').then(
        (m) => m.ServiceList
      ),
  },
  {
    path: 'services/create',
    title: 'Crear Servicio - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/service/ui/forms/service-form/service-form').then(
        (m) => m.ServiceForm
      ),
  },
  {
    path: 'services/:id/edit',
    title: 'Editar Servicio - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/service/ui/forms/service-form/service-form').then(
        (m) => m.ServiceForm
      ),
  },
];
