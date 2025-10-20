import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { CreateProductRequest } from '@features/dashboard/data/models/create-product-request.interface';
import { ProductResponse } from '@features/dashboard/data/models/product-response.interface';
import { ProductSelectResponse } from '@features/dashboard/data/models/product-select-response.interface';
import { SearchProductsParams } from '@features/dashboard/data/models/search-products-params.interface';
import { UpdateProductRequest } from '@features/dashboard/data/models/update-product-request.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { ApiPlainResponse } from '@shared/data/models/api-plain-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Product {
  private readonly http = inject(HttpClient);
  private readonly httpParamsBuilder = inject(HttpParamsBuilderService);
  private readonly errorHandler = inject(HttpErrorHandlerService);
  private readonly apiUrl = `${ environment.apiUrl }/product`;

  searchProducts(
    params: SearchProductsParams = {}
  ): Observable<ApiDataResponse<ApiPaginatedResponse<ProductResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
    .get<ApiDataResponse<ApiPaginatedResponse<ProductResponse>>>(`${ this.apiUrl }/search`, {
      params: httpParams,
    })
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  findProductById(id: number): Observable<ApiDataResponse<ProductResponse>> {
    return this.http
    .get<ApiDataResponse<ProductResponse>>(`${ this.apiUrl }/${ id }`)
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  getProductsForSelect(search?: string): Observable<ApiDataResponse<ProductSelectResponse[]>> {
    let httpParams = new HttpParams();

    if (search !== undefined && search !== null && search.trim() !== '') {
      httpParams = httpParams.set('search', search.trim());
    }

    return this.http
    .get<ApiDataResponse<ProductSelectResponse[]>>(`${ this.apiUrl }/for-select`, {
      params: httpParams,
    })
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  createProduct(request: CreateProductRequest): Observable<ApiDataResponse<ProductResponse>> {
    const formData = new FormData();

    formData.append('name', request.name.trim());
    formData.append('price', request.price.toString());
    formData.append('stockQuantity', request.stockQuantity.toString());
    formData.append('subcategoryId', request.subcategoryId.toString());

    if (request.brand) {
      formData.append('brand', request.brand.trim());
    }

    if (request.description) {
      formData.append('description', request.description.trim());
    }

    if (request.sku) {
      formData.append('sku', request.sku.trim());
    }

    if (request.image) {
      formData.append('image', request.image, request.image.name);
    }

    return this.http
    .post<ApiDataResponse<ProductResponse>>(this.apiUrl, formData)
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  updateProduct(
    id: number,
    request: UpdateProductRequest
  ): Observable<ApiDataResponse<ProductResponse>> {
    const formData = new FormData();

    formData.append('name', request.name.trim());
    formData.append('price', request.price.toString());
    formData.append('stockQuantity', request.stockQuantity.toString());
    formData.append('subcategoryId', request.subcategoryId.toString());

    if (request.brand) {
      formData.append('brand', request.brand.trim());
    }

    if (request.description) {
      formData.append('description', request.description.trim());
    }

    if (request.sku) {
      formData.append('sku', request.sku.trim());
    }

    if (request.image) {
      formData.append('image', request.image, request.image.name);
    }

    return this.http
    .put<ApiDataResponse<ProductResponse>>(`${ this.apiUrl }/${ id }`, formData)
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  activateProduct(id: number): Observable<ApiPlainResponse> {
    return this.http
    .put<ApiPlainResponse>(`${ this.apiUrl }/${ id }/activate`, {})
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  deactivateProduct(id: number): Observable<ApiPlainResponse> {
    return this.http
    .put<ApiPlainResponse>(`${ this.apiUrl }/${ id }/deactivate`, {})
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  deleteProduct(id: number): Observable<ApiPlainResponse> {
    return this.http
    .delete<ApiPlainResponse>(`${ this.apiUrl }/${ id }`)
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }
}
