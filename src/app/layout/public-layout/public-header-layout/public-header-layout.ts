import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '@core/services/theme/theme';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideLogIn, lucideMoon, lucideSun, lucideUserPlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';

@Component({
  selector: 'app-public-header-layout',
  imports: [NgIconComponent, HlmIcon, ...HlmButtonImports, RouterLink],
  providers: [
    provideIcons({
      lucideMoon,
      lucideSun,
      lucideLogIn,
      lucideUserPlus,
    }),
  ],
  templateUrl: './public-header-layout.html',
  styleUrl: './public-header-layout.css',
})
export class PublicHeaderLayout {
  private readonly themeService = inject(ThemeService);

  readonly isDark = computed(() => this.themeService.isDark());

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
