import { BaseResponse } from '@shared/data/models/base-response.interface';

export interface ApiPlainResponse extends BaseResponse {
  message: string;
  httpStatus: string;
}
