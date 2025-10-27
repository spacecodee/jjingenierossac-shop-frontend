import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuantityType } from '@features/dashboard/data/models/quantity-type.enum';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';

@Component({
  selector: 'app-quantity-type-select',
  imports: [BrnSelectImports, HlmSelectImports, FormsModule],
  templateUrl: './quantity-type-select.html',
})
export class QuantityTypeSelect {
  readonly QuantityType = QuantityType;

  readonly placeholder = input<string>('Selecciona un tipo');
  readonly disabled = input<boolean>(false);
  readonly value = input<QuantityType | null>(null);

  readonly valueChange = output<QuantityType | null>();

  onValueChange(value: string): void {
    if (value === 'ALL') {
      this.valueChange.emit(null);
    } else {
      this.valueChange.emit(value as QuantityType);
    }
  }

  reset(): void {
    this.valueChange.emit(null);
  }
}
