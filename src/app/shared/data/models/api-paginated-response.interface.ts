import { PaginationInfo } from './pagination-info.interface';

export interface ApiPaginatedResponse<T> {
  pageData: T[];
  pagination: PaginationInfo;
}
