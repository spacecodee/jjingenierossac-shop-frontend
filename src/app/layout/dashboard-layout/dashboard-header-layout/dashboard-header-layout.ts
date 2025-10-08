import { Component, inject, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { User } from '@core/models/user.interface';
import { RoleTranslationService } from '@core/services/role-translation/role-translation';
import { CompanyLogoComponent } from '@shared/components/company-logo-component/company-logo-component';
import { UserRole } from '@shared/models/user-role.enum';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-dashboard-header-layout',
  imports: [HlmAvatarImports, CompanyLogoComponent, NgOptimizedImage],
  templateUrl: './dashboard-header-layout.html',
  styleUrl: './dashboard-header-layout.css',
  providers: [provideIcons({ lucideMoon, lucideSun })],
})
export class DashboardHeaderLayout {
  private readonly roleTranslationService = inject(RoleTranslationService);

  readonly currentUser = signal<User | null>({
    id: '1',
    username: 'admin_user',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return '??';

    if (user.firstName && user.lastName) {
      return `${ user.firstName[0] }${ user.lastName[0] }`.toUpperCase();
    }

    return user.username.substring(0, 2).toUpperCase();
  }

  getRoleTranslation(): string {
    const user = this.currentUser();
    return user ? this.roleTranslationService.translate(user.role) : '';
  }

  getRoleBadgeClasses(): string {
    const user = this.currentUser();
    if (!user) return 'bg-border text-foreground';

    const variant = this.roleTranslationService.getRoleBadgeVariant(user.role);
    const variantClasses = {
      destructive: 'bg-destructive text-destructive-foreground',
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      outline: 'border border-border text-foreground',
    };

    return variantClasses[variant];
  }
}
