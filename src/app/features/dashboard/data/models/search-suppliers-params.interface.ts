import { SortDirection } from '@shared/data/types/sort-direction.type';

export interface SearchSuppliersParams {
  search?: string;
  taxId?: string;
  name?: string;
  isActive?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}
