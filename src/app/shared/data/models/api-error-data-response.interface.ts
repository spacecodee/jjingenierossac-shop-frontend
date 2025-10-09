import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';

export interface ApiErrorDataResponse<E> extends ApiErrorResponse {
  data: E;
}
