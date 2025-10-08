import { isPlatformBrowser } from '@angular/common';
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { StorageService } from '../storage/storage';
import { ThemeModeType } from '@core/data/types/theme-mode-type';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly storageService = inject(StorageService);

  private readonly THEME_STORAGE_KEY = 'theme-preference';

  readonly themeMode = signal<ThemeModeType>(this.getInitialTheme());
  readonly isDark = signal<boolean>(false);

  constructor() {
    if (this.isBrowser) {
      this.initializeTheme();
      this.listenToSystemThemeChanges();
    }

    effect(() => {
      const mode = this.themeMode();
      this.applyTheme(mode);
      this.storageService.setItem(this.THEME_STORAGE_KEY, mode, 'localStorage');
    });
  }

  setTheme(mode: ThemeModeType): void {
    this.themeMode.set(mode);
  }

  toggleTheme(): void {
    const currentMode = this.themeMode();
    if (currentMode === 'system') {
      this.themeMode.set(this.getSystemTheme() === 'dark' ? 'light' : 'dark');
    } else {
      this.themeMode.set(currentMode === 'dark' ? 'light' : 'dark');
    }
  }

  private getInitialTheme(): ThemeModeType {
    if (!this.isBrowser) return 'system';

    const savedTheme = this.storageService.getItem<ThemeModeType>(
      this.THEME_STORAGE_KEY,
      'localStorage'
    );

    return savedTheme || 'system';
  }

  private initializeTheme(): void {
    const mode = this.themeMode();
    this.applyTheme(mode);
  }

  private applyTheme(mode: ThemeModeType): void {
    if (!this.isBrowser) return;

    const root = document.documentElement;
    const effectiveTheme = mode === 'system' ? this.getSystemTheme() : mode;

    this.isDark.set(effectiveTheme === 'dark');

    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  private getSystemTheme(): 'light' | 'dark' {
    if (!this.isBrowser) return 'light';

    return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private listenToSystemThemeChanges(): void {
    if (!this.isBrowser) return;

    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', (_) => {
      if (this.themeMode() === 'system') {
        this.applyTheme('system');
      }
    });
  }
}
