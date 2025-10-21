export interface SupplierResponse {
  supplierId: number;
  name: string;
  taxId: string | null;
  contactPerson: string | null;
  email: string | null;
  phoneNumber: string | null;
  address: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
