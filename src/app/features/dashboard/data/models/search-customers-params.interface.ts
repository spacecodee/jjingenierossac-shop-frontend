import { SortDirection } from '@shared/data/types/sort-direction.type';
import { CustomerStatusFilter } from '../types/customer-status-filter.type';
import { LastLoginFilter } from '../types/last-login-filter.type';

export interface SearchCustomersParams {
  search?: string;
  status?: CustomerStatusFilter;
  emailVerified?: boolean;
  dateFrom?: string;
  dateTo?: string;
  lastLoginFilter?: LastLoginFilter;
  isLocked?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}
