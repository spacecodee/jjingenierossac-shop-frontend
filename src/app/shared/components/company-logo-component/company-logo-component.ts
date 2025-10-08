import { Component, computed, input } from '@angular/core';
import { LogoTextSizeType } from '@shared/data/types/logo-text-size-type';

@Component({
  selector: 'app-company-logo',
  imports: [],
  templateUrl: './company-logo-component.html',
  styleUrl: './company-logo-component.css',
})
export class CompanyLogoComponent {
  readonly companyName = 'J&J Ingenieros SAC';
  readonly size = input<LogoTextSizeType>('lg');

  readonly textClass = computed(() => {
    const baseClasses = 'font-medium';
    const sizeClass = {
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    }[this.size()];

    return `${ baseClasses } ${ sizeClass }`;
  });
}
