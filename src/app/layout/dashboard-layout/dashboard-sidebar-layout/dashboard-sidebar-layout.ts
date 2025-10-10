import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth/auth.service';
import { ThemeService } from '@core/services/theme/theme';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideHouse,
  lucideLogOut,
  lucideMoon,
  lucidePackage,
  lucideSettings,
  lucideShoppingCart,
  lucideSun,
  lucideTag,
  lucideUsers,
} from '@ng-icons/lucide';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { MenuItemInterface } from '@shared/data/models/menu-item.interface';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-dashboard-sidebar-layout',
  imports: [NgIconComponent, HlmIcon, HlmSidebarImports, HlmSpinner, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-sidebar-layout.html',
  styleUrl: './dashboard-sidebar-layout.css',
  providers: [
    provideIcons({
      lucideHouse,
      lucideShoppingCart,
      lucidePackage,
      lucideTag,
      lucideUsers,
      lucideSettings,
      lucideMoon,
      lucideSun,
      lucideLogOut,
    }),
  ],
})
export class DashboardSidebarLayout {
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isDark = computed(() => this.themeService.isDark());
  readonly isLoggingOut = signal<boolean>(false);

  readonly menuItems = signal<MenuItemInterface[]>([
    {
      label: 'Inicio',
      route: '/dashboard/overview',
      icon: 'lucideHouse',
    },
    {
      label: 'Ventas',
      route: '/dashboard/sales',
      icon: 'lucideShoppingCart',
    },
    {
      label: 'Productos',
      route: '/dashboard/products',
      icon: 'lucidePackage',
    },
    {
      label: 'Categorías de Servicio',
      route: '/dashboard/service-categories',
      icon: 'lucideTag',
    },
    {
      label: 'Clientes',
      route: '/dashboard/customers',
      icon: 'lucideUsers',
    },
    {
      label: 'Configuración',
      route: '/dashboard/settings',
      icon: 'lucideSettings',
    },
  ]);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    if (this.isLoggingOut()) return;

    this.isLoggingOut.set(true);

    this.authService.logout().subscribe({
      next: (response) => {
        const message = response.message || 'Sesión cerrada exitosamente';
        toast.success('Sesión cerrada', {
          description: message,
        });
        this.router.navigate(['/auth/account/login']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoggingOut.set(false);

        if (error.status === 0) {
          toast.info('Sin conexión', {
            description: 'No hay conexión. El cierre de sesión se realizó localmente.',
          });
        } else if (error.status === 401) {
          toast.info('Sesión finalizada', {
            description: error.message || 'Tu sesión ha finalizado.',
          });
        } else {
          toast.error('Error al cerrar sesión', {
            description: error.message || 'Ocurrió un error. La sesión se cerró localmente.',
          });
        }

        this.router.navigate(['/auth/account/login']).then((r) => !r && undefined);
      },
    });
  }
}
