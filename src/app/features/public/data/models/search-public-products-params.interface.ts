import { SortDirection } from '@shared/data/types/sort-direction.type';

export interface SearchPublicProductsParams {
  search?: string;
  categoryId?: number;
  subcategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}
