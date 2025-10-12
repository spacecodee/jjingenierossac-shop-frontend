import { BatchOperationItemResponse } from './batch-operation-item-response.interface';

export interface BatchOperationResponse {
  totalRequested: number;
  successful: number;
  failed: number;
  alreadyInDesiredState: number;
  results: BatchOperationItemResponse[];
}
