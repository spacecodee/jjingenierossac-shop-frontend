import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
  BatchActivateServiceCategoriesRequest
} from '@features/dashboard/data/models/batch-activate-service-categories-request.interface';
import {
  BatchDeactivateServiceCategoriesRequest
} from '@features/dashboard/data/models/batch-deactivate-service-categories-request.interface';
import { BatchOperationResponse } from '@features/dashboard/data/models/batch-operation-response.interface';
import {
  CreateServiceCategoryRequest
} from '@features/dashboard/data/models/create-service-category-request.interface';
import {
  SearchServiceCategoriesParams
} from '@features/dashboard/data/models/search-service-categories-params.interface';
import { ServiceCategoryResponse } from '@features/dashboard/data/models/service-category-response.interface';
import {
  ServiceCategorySelectResponse
} from '@features/dashboard/data/models/service-category-select-response.interface';
import {
  UpdateServiceCategoryRequest
} from '@features/dashboard/data/models/update-service-category-request.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { ApiPlainResponse } from '@shared/data/models/api-plain-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceCategoryService {
  private readonly http = inject(HttpClient);
  private readonly httpParamsBuilder = inject(HttpParamsBuilderService);
  private readonly errorHandler = inject(HttpErrorHandlerService);
  private readonly apiUrl = `${ environment.apiUrl }/service-category`;

  searchServiceCategories(
    params: SearchServiceCategoriesParams = {}
  ): Observable<ApiDataResponse<ApiPaginatedResponse<ServiceCategoryResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
      .get<ApiDataResponse<ApiPaginatedResponse<ServiceCategoryResponse>>>(
        `${ this.apiUrl }/search`,
        { params: httpParams }
      )
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  createServiceCategory(
    request: CreateServiceCategoryRequest
  ): Observable<ApiDataResponse<ServiceCategoryResponse>> {
    return this.http
      .post<ApiDataResponse<ServiceCategoryResponse>>(this.apiUrl, request)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  findServiceCategoryById(id: number): Observable<ApiDataResponse<ServiceCategoryResponse>> {
    return this.http
      .get<ApiDataResponse<ServiceCategoryResponse>>(`${ this.apiUrl }/${ id }`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  getServiceCategoriesForSelect(
    name?: string
  ): Observable<ApiDataResponse<ServiceCategorySelectResponse[]>> {
    let httpParams = new HttpParams();

    if (name !== undefined && name !== null && name.trim() !== '') {
      httpParams = httpParams.set('name', name.trim());
    }

    return this.http
      .get<ApiDataResponse<ServiceCategorySelectResponse[]>>(`${ this.apiUrl }/for-select`, {
        params: httpParams,
      })
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  updateServiceCategory(
    id: number,
    request: UpdateServiceCategoryRequest
  ): Observable<ApiDataResponse<ServiceCategoryResponse>> {
    return this.http
      .put<ApiDataResponse<ServiceCategoryResponse>>(`${ this.apiUrl }/${ id }`, request)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  activateServiceCategory(id: number): Observable<ApiPlainResponse> {
    return this.http
      .put<ApiPlainResponse>(`${ this.apiUrl }/${ id }/activate`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  deactivateServiceCategory(id: number): Observable<ApiPlainResponse> {
    return this.http
      .put<ApiPlainResponse>(`${ this.apiUrl }/${ id }/deactivate`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  batchActivateServiceCategories(
    request: BatchActivateServiceCategoriesRequest
  ): Observable<ApiDataResponse<BatchOperationResponse>> {
    return this.http
      .put<ApiDataResponse<BatchOperationResponse>>(`${ this.apiUrl }/batch/activate`, request)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  batchDeactivateServiceCategories(
    request: BatchDeactivateServiceCategoriesRequest
  ): Observable<ApiDataResponse<BatchOperationResponse>> {
    return this.http
      .put<ApiDataResponse<BatchOperationResponse>>(`${ this.apiUrl }/batch/deactivate`, request)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  deleteServiceCategory(id: number): Observable<ApiPlainResponse> {
    return this.http
      .delete<ApiPlainResponse>(`${ this.apiUrl }/${ id }`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }
}
