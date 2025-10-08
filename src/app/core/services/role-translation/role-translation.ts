import { Injectable } from '@angular/core';
import { RoleTranslation } from '@shared/data/models/role-translation.type';
import { UserRole } from '@shared/data/models/user-role.enum';

@Injectable({
  providedIn: 'root',
})
export class RoleTranslationService {
  private readonly translations: RoleTranslation = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.CUSTOMER]: 'Cliente',
    [UserRole.SELLER]: 'Vendedor',
  };

  translate(role: UserRole): string {
    return this.translations[role] || role;
  }

  getRoleBadgeVariant(role: UserRole): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (role) {
      case UserRole.ADMIN:
        return 'destructive';
      case UserRole.SELLER:
        return 'default';
      case UserRole.CUSTOMER:
        return 'secondary';
      default:
        return 'outline';
    }
  }
}
