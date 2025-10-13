import { ServiceCategoryResponse } from './service-category-response.interface';

export interface ServiceResponse {
  serviceId: number;
  name: string;
  description: string;
  estimatedDuration: string;
  isActive: boolean;
  serviceCategory: ServiceCategoryResponse;
  createdAt: string;
  updatedAt: string;
}
