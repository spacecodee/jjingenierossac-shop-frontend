import { TestBed } from '@angular/core/testing';
import { RoleTranslationService } from './role-translation';
import { UserRole } from '@app/shared/models/user-role.enum';

describe('RoleTranslationService', () => {
  let service: RoleTranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleTranslationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('translate', () => {
    it('should translate ADMIN to Administrador', () => {
      expect(service.translate(UserRole.ADMIN)).toBe('Administrador');
    });

    it('should translate CUSTOMER to Cliente', () => {
      expect(service.translate(UserRole.CUSTOMER)).toBe('Cliente');
    });

    it('should translate SELLER to Vendedor', () => {
      expect(service.translate(UserRole.SELLER)).toBe('Vendedor');
    });
  });

  describe('getRoleBadgeVariant', () => {
    it('should return destructive for ADMIN role', () => {
      expect(service.getRoleBadgeVariant(UserRole.ADMIN)).toBe('destructive');
    });

    it('should return default for CUSTOMER role', () => {
      expect(service.getRoleBadgeVariant(UserRole.CUSTOMER)).toBe('default');
    });

    it('should return secondary for SELLER role', () => {
      expect(service.getRoleBadgeVariant(UserRole.SELLER)).toBe('secondary');
    });
  });
});
