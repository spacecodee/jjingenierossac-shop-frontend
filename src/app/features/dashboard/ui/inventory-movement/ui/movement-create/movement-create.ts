import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateStockEntryRequest } from '@features/dashboard/data/models/create-stock-entry-request.interface';
import { StockMovementService } from '@features/dashboard/data/services/stock-movement/stock-movement';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucidePlus } from '@ng-icons/lucide';
import { ProductAutocomplete } from '@shared/components/product-autocomplete/product-autocomplete';
import { SupplierAutocomplete } from '@shared/components/supplier-autocomplete/supplier-autocomplete';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-movement-create',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmInputImports,
    ProductAutocomplete,
    SupplierAutocomplete,
    NgIcon,
    FormsModule,
    HlmIcon,
  ],
  providers: [
    { provide: 'LOCALE_ID', useValue: 'es-PE' },
    provideIcons({ lucidePlus, lucideArrowLeft }),
  ],
  templateUrl: './movement-create.html',
})
export class MovementCreate {
  constructor() {
    registerLocaleData(localeEs, 'es-PE');
  }

  private readonly movementService = inject(StockMovementService);
  private readonly router = inject(Router);
  private readonly productAutocomplete = viewChild.required(ProductAutocomplete);

  readonly isSubmitting = signal<boolean>(false);
  readonly selectedProductId = signal<number | null>(null);
  readonly selectedSupplierId = signal<number | null>(null);
  readonly quantity = signal<number | null>(null);
  readonly notes = signal<string>('');

  readonly isValid = computed(() => {
    return (
      this.selectedProductId() !== null &&
      this.selectedSupplierId() !== null &&
      this.quantity() !== null &&
      this.quantity()! > 0
    );
  });

  onProductSelected(productId: number | null): void {
    this.selectedProductId.set(productId);
  }

  onSupplierSelected(supplierId: number | null): void {
    this.selectedSupplierId.set(supplierId);
  }

  onQuantityChange(value: string | number | null): void {
    const num = value === null || value === '' ? null : Number(value);
    if (num !== null && Number.isNaN(num)) {
      this.quantity.set(null);
    } else {
      this.quantity.set(num);
    }
  }

  onNotesChange(value: string): void {
    this.notes.set(value);
  }

  submit(keepOnForm = false): void {
    if (!this.isValid()) {
      toast.error('Rellena todos los campos requeridos correctamente');
      return;
    }

    this.isSubmitting.set(true);

    const payload: CreateStockEntryRequest = {
      productId: this.selectedProductId()!,
      supplierId: this.selectedSupplierId()!,
      movementType: 'STOCK_IN',
      quantityChange: this.quantity()!,
      notes: this.notes() || null,
    };

    this.movementService.createStockEntry(payload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        toast.success(
          `Entrada registrada exitosamente. Stock actualizado: ${ response.data.newStock } unidades (+${ response.data.quantityChange })`
        );
        if (keepOnForm) {
          this.onRegisterAnotherKeepSupplier();
          return;
        }
        this.router.navigate(['/dashboard/inventory-movements']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isSubmitting.set(false);
        const message = error.message || 'No se pudo registrar la entrada';
        toast.error('Error al registrar entrada', { description: message });
      },
    });
  }

  onRegisterAnotherKeepSupplier(): void {
    this.productAutocomplete().reset();
    this.selectedProductId.set(null);
    this.quantity.set(null);
    this.notes.set('');
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/inventory-movements']).then((r) => !r && undefined);
  }
}
