import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';

@Component({
  selector: 'app-batch-action-bar',
  imports: [...HlmButtonImports, NgIcon, HlmIconImports],
  providers: [
    provideIcons({
      lucideX,
    }),
  ],
  templateUrl: './batch-action-bar.html',
  styleUrl: './batch-action-bar.css',
})
export class BatchActionBar {
  readonly selectedCount = input.required<number>();
  readonly entityName = input<string>('elemento(s)');
  readonly activateLabel = input<string>('Activar seleccionadas');
  readonly deactivateLabel = input<string>('Desactivar seleccionadas');
  readonly cancelLabel = input<string>('Cancelar');

  readonly activate = output<void>();
  readonly deactivate = output<void>();
  readonly cancelled = output<void>();
}
