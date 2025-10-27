import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MovementType } from '@features/dashboard/data/models/movement-type.enum';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

@Component({
  selector: 'app-movement-type-select',
  imports: [BrnSelectImports, HlmSelectImports, FormsModule],
  templateUrl: './movement-type-select.html',
})
export class MovementTypeSelect {
  readonly MovementType = MovementType;

  readonly placeholder = input<string>('Selecciona un tipo');
  readonly disabled = input<boolean>(false);
  readonly value = input<MovementType | null>(null);

  readonly valueChange = output<MovementType | null>();

  onValueChange(value: string): void {
    if (value === 'ALL') {
      this.valueChange.emit(null);
    } else {
      this.valueChange.emit(value as MovementType);
    }
  }

  reset(): void {
    this.valueChange.emit(null);
  }
}
