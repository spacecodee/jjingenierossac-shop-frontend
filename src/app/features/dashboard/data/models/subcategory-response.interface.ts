import { CategoryBasicResponse } from './category-basic-response.interface';

export interface SubcategoryBasicResponse {
  subcategoryId: number;
  subcategoryName: string;
  subcategoryIsActive: boolean;
  category: CategoryBasicResponse;
}

export interface SubcategoryResponse {
  subcategoryId: number;
  category: CategoryBasicResponse;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
