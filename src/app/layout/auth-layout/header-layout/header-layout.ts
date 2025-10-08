import { Component, computed, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideHouse, lucideMoon, lucideSun } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { ThemeService } from '@core/services/theme/theme';

@Component({
  selector: 'app-header-layout',
  imports: [NgIconComponent, HlmIcon, HlmButtonImports],
  templateUrl: './header-layout.html',
  styleUrl: './header-layout.css',
  providers: [provideIcons({ lucideHouse, lucideMoon, lucideSun })],
})
export class HeaderLayout {
  private readonly themeService = inject(ThemeService);

  readonly isDark = computed(() => this.themeService.isDark());

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
