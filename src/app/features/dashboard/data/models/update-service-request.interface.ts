export interface UpdateServiceRequest {
  name: string;
  description: string;
  estimatedDuration?: string;
  serviceCategoryId: number;
}
