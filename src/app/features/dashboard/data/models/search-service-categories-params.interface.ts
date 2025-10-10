import { SortDirection } from '@shared/data/types/sort-direction.type';

export interface SearchServiceCategoriesParams {
  name?: string;
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
