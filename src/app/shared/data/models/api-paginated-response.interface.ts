import { PaginationInfo } from './pagination-info.interface';

export interface ApiPaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}
