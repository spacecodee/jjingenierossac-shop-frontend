import { BaseResponse } from '@shared/data/models/base-response.interface';

export interface ApiErrorResponse extends BaseResponse {
  backendMessage: string;
  message: string;
  path: string;
  method: string;
  status: number;
}
