export interface PublicServiceDetailResponse {
  serviceId: number;
  name: string;
  description: string;
  estimatedDuration: string;
  serviceCategory: {
    serviceCategoryId: number;
    name: string;
  };
}
