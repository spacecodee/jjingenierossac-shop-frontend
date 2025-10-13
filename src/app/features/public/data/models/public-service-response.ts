import { PublicServiceCategoryResponse } from './public-service-category-response';

export interface PublicServiceResponse {
  serviceId: number;
  name: string;
  description: string;
  estimatedDuration: string;
  serviceCategory: PublicServiceCategoryResponse;
}
