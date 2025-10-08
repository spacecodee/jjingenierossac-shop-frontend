import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '@app/core/services/theme/theme';
import { MenuItemInterface } from '@shared/data/models/menu-item.interface';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideHouse,
  lucideLogOut,
  lucideMoon,
  lucidePackage,
  lucideSettings,
  lucideShoppingCart,
  lucideSun,
  lucideUsers,
} from '@ng-icons/lucide';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';

@Component({
  selector: 'app-dashboard-sidebar-layout',
  imports: [
    NgIconComponent,
    HlmIcon,
    HlmSidebarImports,
    RouterLink,
    RouterLinkActive,

  ],
  templateUrl: './dashboard-sidebar-layout.html',
  styleUrl: './dashboard-sidebar-layout.css',
  providers: [
    provideIcons({
      lucideHouse,
      lucideShoppingCart,
      lucidePackage,
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
  private readonly router = inject(Router);

  readonly isDark = computed(() => this.themeService.isDark());

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
    console.log('Logout clicked');
    this.router
      .navigate(['/auth/account/login'])
      .then((r) => !r && console.error('Navigation to login failed'));
  }
}
