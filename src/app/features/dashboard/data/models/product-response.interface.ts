import { SubcategoryBasicResponse } from '@features/dashboard/data/models/subcategory-response.interface';

export interface ProductResponse {
  productId: number;
  subcategory: SubcategoryBasicResponse;
  name: string;
  brand?: string | null;
  price: number;
  stockQuantity: number;
  sku?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
