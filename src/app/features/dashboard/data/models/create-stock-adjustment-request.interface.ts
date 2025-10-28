import { AdjustmentReason } from '@features/dashboard/data/models/adjustment-reason.enum';
import { AdjustmentType } from '@features/dashboard/data/models/adjustment-type.enum';

export interface CreateStockAdjustmentRequest {
  productId: number;
  movementType: 'ADJUSTMENT';
  adjustmentType: AdjustmentType;
  quantity: number;
  reason: AdjustmentReason;
  notes: string;
}
