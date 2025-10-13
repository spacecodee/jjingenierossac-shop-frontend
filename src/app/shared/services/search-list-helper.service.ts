import { Injectable, Signal, WritableSignal } from '@angular/core';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { toast } from 'ngx-sonner';
import { PaginationState } from '@shared/data/models/pagination-state.interface';
import { ActiveFilterType } from '@shared/data/types/active-filter.type';

@Injectable({
  providedIn: 'root',
})
export class SearchListHelperService {
  applyActiveFilter<T extends { isActive?: boolean }>(
    params: T,
    activeFilter: Signal<ActiveFilterType>
  ): T {
    if (activeFilter() === 'active') {
      params.isActive = true;
    } else if (activeFilter() === 'inactive') {
      params.isActive = false;
    }
    return params;
  }

  handlePaginatedResponse<T>(
    response: ApiPaginatedResponse<T>,
    dataSignal: WritableSignal<T[]>,
    paginationState: PaginationState
  ): void {
    dataSignal.set(response.pageData);
    paginationState.totalPages.set(response.pagination.totalPages);
    paginationState.totalElements.set(response.pagination.totalElements);
    paginationState.isFirst.set(response.pagination.first);
    paginationState.isLast.set(response.pagination.last);
    paginationState.isLoading.set(false);
    paginationState.isRefreshing.set(false);
  }

  handleSearchError(
    error: ApiErrorResponse,
    paginationState: PaginationState,
    errorTitle: string,
    defaultErrorMessage: string
  ): void {
    paginationState.isLoading.set(false);
    paginationState.isRefreshing.set(false);
    toast.error(errorTitle, {
      description: error.message || defaultErrorMessage,
    });
  }
}
