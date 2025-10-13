import { WritableSignal } from '@angular/core';

export interface PaginationState {
  totalPages: WritableSignal<number>;
  totalElements: WritableSignal<number>;
  isFirst: WritableSignal<boolean>;
  isLast: WritableSignal<boolean>;
  isLoading: WritableSignal<boolean>;
  isRefreshing: WritableSignal<boolean>;
}
