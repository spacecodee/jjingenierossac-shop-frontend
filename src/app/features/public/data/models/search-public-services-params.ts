import { SortDirection } from '@shared/data/types/sort-direction.type';

export interface SearchPublicServicesParams {
  name?: string;
  serviceCategoryId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}
