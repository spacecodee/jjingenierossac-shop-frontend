export interface CreateProductRequest {
  name: string;
  brand?: string;
  description?: string;
  price: number;
  stockQuantity: number;
  sku?: string;
  subcategoryId: number;
  image?: File;
}
