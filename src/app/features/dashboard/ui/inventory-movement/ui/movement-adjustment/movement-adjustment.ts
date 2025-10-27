import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdjustmentReason } from '@features/dashboard/data/models/adjustment-reason.enum';
import { AdjustmentType } from '@features/dashboard/data/models/adjustment-type.enum';
import {
  CreateStockAdjustmentRequest
} from '@features/dashboard/data/models/create-stock-adjustment-request.interface';
import { ProductResponse } from '@features/dashboard/data/models/product-response.interface';
import { Product } from '@features/dashboard/data/services/product/product';
import { StockMovementService } from '@features/dashboard/data/services/stock-movement/stock-movement';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideCheck, lucideInfo, lucideTriangleAlert } from '@ng-icons/lucide';
import { ProductAutocomplete } from '@shared/components/product-autocomplete/product-autocomplete';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-movement-adjustment',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmInputImports,
    ...BrnSelectImports,
    ...HlmSelectImports,
    ...HlmLabelImports,
    ...HlmBadgeImports,
    ...BrnAlertDialogImports,
    ...HlmAlertDialogImports,
    ProductAutocomplete,
    NgIcon,
    HlmIcon,
    HlmSeparator,
    FormsModule,
  ],
  providers: [
    { provide: 'LOCALE_ID', useValue: 'es-PE' },
    provideIcons({ lucideArrowLeft, lucideCheck, lucideInfo, lucideTriangleAlert }),
  ],
  templateUrl: './movement-adjustment.html',
})
export class MovementAdjustment {
  private readonly movementService = inject(StockMovementService);
  private readonly productService = inject(Product);
  private readonly router = inject(Router);

  readonly AdjustmentType = AdjustmentType;

  readonly isSubmitting = signal<boolean>(false);
  readonly isLoadingProduct = signal<boolean>(false);
  readonly selectedProductId = signal<number | null>(null);
  readonly currentStock = signal<number | null>(null);
  readonly adjustmentType = signal<AdjustmentType | null>(null);
  readonly quantity = signal<number | null>(null);
  readonly reason = signal<AdjustmentReason | null>(null);
  readonly notes = signal<string>('');

  readonly adjustmentTypeOptions = [
    { value: AdjustmentType.INCREMENT, label: 'Incrementar (+)' },
    { value: AdjustmentType.DECREMENT, label: 'Reducir (-)' },
  ];

  readonly reasonOptions = [
    { value: AdjustmentReason.AUDIT_DISCREPANCY, label: 'Diferencia en auditoría física' },
    { value: AdjustmentReason.DAMAGED_GOODS, label: 'Mercancía dañada' },
    { value: AdjustmentReason.THEFT, label: 'Robo detectado' },
    { value: AdjustmentReason.REGISTRATION_ERROR, label: 'Error de registro previo' },
    { value: AdjustmentReason.EXPIRATION, label: 'Vencimiento de productos' },
    { value: AdjustmentReason.HANDLING_LOSS, label: 'Merma por manipulación' },
    { value: AdjustmentReason.OTHER, label: 'Otro' },
  ];

  readonly newStock = computed(() => {
    const current = this.currentStock();
    const qty = this.quantity();
    const type = this.adjustmentType();

    if (current === null || qty === null || type === null) {
      return null;
    }

    return type === AdjustmentType.INCREMENT ? current + qty : current - qty;
  });

  readonly isNegativeStock = computed(() => {
    const newStock = this.newStock();
    return newStock !== null && newStock < 0;
  });

  readonly notesCharCount = computed(() => this.notes().length);

  readonly isNotesValid = computed(() => {
    const count = this.notesCharCount();
    return count >= 20 && count <= 500;
  });

  readonly isFormValid = computed(() => {
    return (
      this.selectedProductId() !== null &&
      this.adjustmentType() !== null &&
      this.quantity() !== null &&
      this.quantity()! > 0 &&
      this.reason() !== null &&
      this.isNotesValid() &&
      !this.isNegativeStock()
    );
  });

  constructor() {
    registerLocaleData(localeEs, 'es-PE');
  }

  onProductSelected(productId: number | null): void {
    this.selectedProductId.set(productId);
    if (productId === null) {
      this.currentStock.set(null);
      return;
    }
    this.loadProductStock(productId);
  }

  onAdjustmentTypeChange(value: string): void {
    this.adjustmentType.set(value as AdjustmentType);
  }

  onReasonChange(value: string): void {
    this.reason.set(value as AdjustmentReason);
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

  loadProductStock(productId: number): void {
    this.isLoadingProduct.set(true);
    this.productService.findProductById(productId).subscribe({
      next: (response: ApiDataResponse<ProductResponse>) => {
        this.currentStock.set(response.data.stockQuantity);
        this.isLoadingProduct.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoadingProduct.set(false);
        toast.error('Error al cargar el producto', {
          description: error.message || 'No se pudo obtener el stock actual',
        });
        this.currentStock.set(null);
      },
    });
  }

  confirmAdjustment(): void {
    if (!this.isFormValid()) {
      toast.error('Formulario inválido', {
        description: 'Por favor completa todos los campos correctamente',
      });
      return;
    }

    this.isSubmitting.set(true);

    const payload: CreateStockAdjustmentRequest = {
      productId: this.selectedProductId()!,
      movementType: 'ADJUSTMENT',
      adjustmentType: this.adjustmentType()!,
      quantity: this.quantity()!,
      reason: this.reason()!,
      notes: this.notes(),
    };

    this.movementService.createStockAdjustment(payload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        const sign = response.data.quantityChange > 0 ? '+' : '';
        toast.success(
          `Ajuste registrado exitosamente. Stock actualizado: ${ response.data.newStock } unidades (${ sign }${ response.data.quantityChange })`
        );
        this.router.navigate(['/dashboard/inventory-movements']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isSubmitting.set(false);
        const message = error.message || 'No se pudo registrar el ajuste';
        toast.error('Error al registrar ajuste', { description: message });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/inventory-movements']).then((r) => !r && undefined);
  }

  getReasonLabel(reason: AdjustmentReason | null): string {
    if (reason === null) return '';
    return this.reasonOptions.find((r) => r.value === reason)?.label || '';
  }
}
