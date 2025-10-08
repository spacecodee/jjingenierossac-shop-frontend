import { TestBed } from '@angular/core/testing';
import { StorageService } from '../storage/storage';
import { ThemeService } from './theme';

describe('ThemeService', () => {
  let service: ThemeService;
  let storageService: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    storageService = TestBed.inject(StorageService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with system theme by default', () => {
    expect(service.themeMode()).toBe('system');
  });

  it('should set theme mode', () => {
    service.setTheme('dark');
    expect(service.themeMode()).toBe('dark');
  });

  it('should toggle theme from light to dark', () => {
    service.setTheme('light');
    service.toggleTheme();
    expect(service.themeMode()).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    service.setTheme('dark');
    service.toggleTheme();
    expect(service.themeMode()).toBe('light');
  });

  it('should persist theme preference to localStorage', (done) => {
    service.setTheme('dark');
    setTimeout(() => {
      const savedTheme = storageService.getItem('theme-preference', 'localStorage');
      expect(savedTheme).toBe('dark');
      done();
    }, 0);
  });

  it('should apply dark class to document root when theme is dark', (done) => {
    service.setTheme('dark');
    setTimeout(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(service.isDark()).toBe(true);
      done();
    }, 0);
  });

  it('should remove dark class from document root when theme is light', (done) => {
    service.setTheme('light');
    setTimeout(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(service.isDark()).toBe(false);
      done();
    }, 0);
  });

  it('should toggle from system theme to explicit theme', () => {
    service.setTheme('system');
    service.toggleTheme();
    expect(['light', 'dark']).toContain(service.themeMode());
  });

  it('should update isDark signal when theme changes', (done) => {
    service.setTheme('dark');
    setTimeout(() => {
      expect(service.isDark()).toBe(true);

      service.setTheme('light');
      setTimeout(() => {
        expect(service.isDark()).toBe(false);
        done();
      }, 0);
    }, 0);
  });
});
