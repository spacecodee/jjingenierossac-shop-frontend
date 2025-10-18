import { SortDirection } from '@shared/data/types/sort-direction.type';

export interface SearchProductsParams {
  search?: string;
  categoryId?: number;
  subcategoryId?: number;
  isActive?: boolean;
  createdAtAfter?: string;
  createdAtBefore?: string;
  updatedAtAfter?: string;
  updatedAtBefore?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}
