export interface CreateServiceRequest {
  name: string;
  description: string;
  estimatedDuration?: string;
  serviceCategoryId: number;
}
