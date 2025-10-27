import { MovementType } from './movement-type.enum';
import { ProductBasicResponse } from './product-basic-response.interface';
import { SupplierBasicResponse } from './supplier-basic-response.interface';
import { UserBasicResponse } from './user-basic-response.interface';

export interface StockMovementResponse {
  movementId: number;
  product: ProductBasicResponse;
  user: UserBasicResponse | null;
  supplier: SupplierBasicResponse | null;
  reservationId: number | null;
  movementType: MovementType;
  quantityChange: number;
  notes: string | null;
  createdAt: string;
}
