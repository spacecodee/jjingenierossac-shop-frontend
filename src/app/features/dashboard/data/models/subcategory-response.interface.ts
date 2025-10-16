import { CategoryBasicResponse } from './category-basic-response.interface';

export interface SubcategoryResponse {
  subcategoryId: number;
  category: CategoryBasicResponse;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
