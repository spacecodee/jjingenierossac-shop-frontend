import { ApiPlainResponse } from '@shared/data/models/api-plain-response.interface';

export interface ApiDataResponse<T> extends ApiPlainResponse {
  data: T;
}
