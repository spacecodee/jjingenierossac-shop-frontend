import { Routes } from '@angular/router';
import { unsavedChangesGuard } from '@core/guards/unsaved-changes.guard';

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
  {
    path: 'categories',
    title: 'Categorías de Productos - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/category/ui/category-list/category-list').then(
        (m) => m.CategoryList
      ),
  },
  {
    path: 'categories/create',
    title: 'Crear Categoría de Producto - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/category/ui/forms/category-form/category-form').then(
        (m) => m.CategoryForm
      ),
  },
  {
    path: 'categories/:id/edit',
    title: 'Editar Categoría de Producto - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/category/ui/forms/category-form/category-form').then(
        (m) => m.CategoryForm
      ),
  },
  {
    path: 'subcategories',
    title: 'Subcategorías de Productos - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/subcategory/ui/subcategory-list/subcategory-list').then(
        (m) => m.SubcategoryList
      ),
  },
  {
    path: 'subcategories/create',
    title: 'Crear Subcategoría de Producto - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/subcategory/ui/forms/subcategory-form/subcategory-form').then(
        (m) => m.SubcategoryForm
      ),
  },
  {
    path: 'subcategories/:id/edit',
    title: 'Editar Subcategoría de Producto - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/subcategory/ui/forms/subcategory-form/subcategory-form').then(
        (m) => m.SubcategoryForm
      ),
  },
  {
    path: 'products',
    title: 'Productos - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/product/ui/product-list/product-list').then(
        (m) => m.ProductList
      ),
  },
  {
    path: 'products/create',
    title: 'Crear Producto - J&J Ingenieros SAC',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('@features/dashboard/ui/product/ui/forms/product-form/product-form').then(
        (m) => m.ProductForm
      ),
  },
  {
    path: 'products/:id/edit',
    title: 'Editar Producto - J&J Ingenieros SAC',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () =>
      import('@features/dashboard/ui/product/ui/forms/product-form/product-form').then(
        (m) => m.ProductForm
      ),
  },
  {
    path: 'suppliers',
    title: 'Proveedores - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/supplier/ui/supplier-list/supplier-list').then(
        (m) => m.SupplierList
      ),
  },
  {
    path: 'suppliers/create',
    title: 'Crear Proveedor - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/supplier/ui/forms/supplier-form/supplier-form').then(
        (m) => m.SupplierForm
      ),
  },
  {
    path: 'suppliers/:id/edit',
    title: 'Editar Proveedor - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/supplier/ui/forms/supplier-form/supplier-form').then(
        (m) => m.SupplierForm
      ),
  },
  {
    path: 'inventory-movements',
    title: 'Historial de Movimientos - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/inventory-movement/ui/movement-list/movement-list').then(
        (m) => m.MovementList
      ),
  },
  {
    path: 'inventory-movements/create',
    title: 'Registrar Entrada de Stock - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/inventory-movement/ui/movement-create/movement-create').then(
        (m) => m.MovementCreate
      ),
  },
  {
    path: 'inventory-movements/:id',
    title: 'Detalle del Movimiento - J&J Ingenieros SAC',
    loadComponent: () =>
      import('@features/dashboard/ui/inventory-movement/ui/movement-detail/movement-detail').then(
        (m) => m.MovementDetail
      ),
  },
];
