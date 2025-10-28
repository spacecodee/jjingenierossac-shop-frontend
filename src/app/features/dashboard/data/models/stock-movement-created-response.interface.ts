import { MovementType } from '@features/dashboard/data/models/movement-type.enum';
import { ProductBasicResponse } from '@features/dashboard/data/models/product-basic-response.interface';
import { SupplierBasicResponse } from '@features/dashboard/data/models/supplier-basic-response.interface';
import { UserBasicResponse } from '@features/dashboard/data/models/user-basic-response.interface';

export interface StockMovementCreatedResponse {
  movementId: number;
  product: ProductBasicResponse;
  supplier: SupplierBasicResponse;
  user: UserBasicResponse;
  movementType: MovementType;
  quantityChange: number;
  notes?: string | null;
  createdAt: string;
  previousStock: number;
  newStock: number;
}
