import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
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
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { ApiPlainResponse } from '@shared/data/models/api-plain-response.interface';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceCategoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${ environment.apiUrl }/service-category`;

  searchServiceCategories(
    params: SearchServiceCategoriesParams = {}
  ): Observable<ApiDataResponse<ApiPaginatedResponse<ServiceCategoryResponse>>> {
    let httpParams = new HttpParams();

    if (params.name !== undefined && params.name !== null) {
      httpParams = httpParams.set('name', params.name);
    }
    if (params.isActive !== undefined && params.isActive !== null) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
    }
    if (params.createdAtAfter) {
      httpParams = httpParams.set('createdAtAfter', params.createdAtAfter);
    }
    if (params.createdAtBefore) {
      httpParams = httpParams.set('createdAtBefore', params.createdAtBefore);
    }
    if (params.updatedAtAfter) {
      httpParams = httpParams.set('updatedAtAfter', params.updatedAtAfter);
    }
    if (params.updatedAtBefore) {
      httpParams = httpParams.set('updatedAtBefore', params.updatedAtBefore);
    }
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return this.http
      .get<ApiDataResponse<ApiPaginatedResponse<ServiceCategoryResponse>>>(
        `${ this.apiUrl }/search`,
        { params: httpParams }
      )
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  createServiceCategory(
    request: CreateServiceCategoryRequest
  ): Observable<ApiDataResponse<ServiceCategoryResponse>> {
    return this.http.post<ApiDataResponse<ServiceCategoryResponse>>(this.apiUrl, request).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  findServiceCategoryById(id: number): Observable<ApiDataResponse<ServiceCategoryResponse>> {
    return this.http.get<ApiDataResponse<ServiceCategoryResponse>>(`${ this.apiUrl }/${ id }`).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.handleError(error));
      })
    );
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
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  updateServiceCategory(
    id: number,
    request: UpdateServiceCategoryRequest
  ): Observable<ApiDataResponse<ServiceCategoryResponse>> {
    return this.http
      .put<ApiDataResponse<ServiceCategoryResponse>>(`${ this.apiUrl }/${ id }`, request)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleError(error));
        })
      );
  }

  activateServiceCategory(id: number): Observable<ApiPlainResponse> {
    return this.http.put<ApiPlainResponse>(`${ this.apiUrl }/${ id }/activate`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => this.handleError(error));
      })
    );
  }

  private handleError(error: HttpErrorResponse): ApiErrorResponse {
    if (error.error && typeof error.error === 'object') {
      const apiError = error.error as ApiErrorResponse;

      return {
        timestamp: apiError.timestamp || new Date().toISOString(),
        backendMessage: apiError.backendMessage || 'Error del servidor',
        message: apiError.message || this.getDefaultErrorMessage(error.status),
        path: apiError.path || '',
        method: apiError.method || '',
        status: apiError.status || error.status,
      };
    }

    return {
      timestamp: new Date().toISOString(),
      backendMessage: 'Error de conexión',
      message: this.getDefaultErrorMessage(error.status),
      path: '',
      method: '',
      status: error.status,
    };
  }

  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 0:
        return 'No se pudo conectar al servidor';
      case 401:
        return 'No autorizado';
      case 403:
        return 'Acceso denegado';
      case 404:
        return 'Recurso no encontrado';
      case 422:
        return 'Error de validación';
      case 500:
        return 'Error interno del servidor';
      default:
        return 'Error desconocido';
    }
  }
}
