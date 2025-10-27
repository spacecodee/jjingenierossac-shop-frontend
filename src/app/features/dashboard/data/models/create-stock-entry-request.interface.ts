export interface CreateStockEntryRequest {
  productId: number;
  supplierId: number;
  movementType: 'STOCK_IN';
  quantityChange: number;
  notes?: string | null;
}
