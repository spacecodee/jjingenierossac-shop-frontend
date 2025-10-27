import { Component, input, output } from '@angular/core';
import { StockMovementResponse } from '@features/dashboard/data/models/stock-movement-response.interface';

@Component({
  selector: 'app-movement-detail-modal',
  imports: [],
  templateUrl: './movement-detail-modal.html',
})
export class MovementDetailModal {
  readonly movement = input.required<StockMovementResponse | null>();
  readonly isOpen = input.required<boolean>();
  readonly closeModal = output<void>();

  onClose(): void {
    this.closeModal.emit();
  }
}
