import { PublicCategoryResponse } from './public-category-response.interface';
import { PublicSubcategoryResponse } from './public-subcategory-response.interface';

export interface PublicProductResponse {
  productId: number;
  name: string;
  brand: string | null;
  price: number;
  imageUrl: string | null;
  stockQuantity: number;
  subcategory: PublicSubcategoryResponse;
  category: PublicCategoryResponse;
  description?: string;
  sku?: string;
}
