import { SortDirection } from '@shared/data/types/sort-direction.type';
import { MovementType } from './movement-type.enum';
import { QuantityType } from './quantity-type.enum';

export interface SearchStockMovementsParams {
  movementType?: MovementType[];
  productId?: number;
  supplierId?: number;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
  quantityType?: QuantityType;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}
