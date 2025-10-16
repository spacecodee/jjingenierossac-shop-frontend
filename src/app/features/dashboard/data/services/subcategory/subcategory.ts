import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { CreateSubcategoryRequest } from '@features/dashboard/data/models/create-subcategory-request.interface';
import { SearchSubcategoriesParams } from '@features/dashboard/data/models/search-subcategories-params.interface';
import { SubcategoryResponse } from '@features/dashboard/data/models/subcategory-response.interface';
import { SubcategorySelectResponse } from '@features/dashboard/data/models/subcategory-select-response.interface';
import { UpdateSubcategoryRequest } from '@features/dashboard/data/models/update-subcategory-request.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { ApiPlainResponse } from '@shared/data/models/api-plain-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Subcategory {
  private readonly http = inject(HttpClient);
  private readonly httpParamsBuilder = inject(HttpParamsBuilderService);
  private readonly errorHandler = inject(HttpErrorHandlerService);
  private readonly apiUrl = `${ environment.apiUrl }/subcategory-product`;

  searchSubcategories(
    params: SearchSubcategoriesParams = {}
  ): Observable<ApiDataResponse<ApiPaginatedResponse<SubcategoryResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
      .get<ApiDataResponse<ApiPaginatedResponse<SubcategoryResponse>>>(`${ this.apiUrl }/search`, {
        params: httpParams,
      })
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  findSubcategoryById(id: number): Observable<ApiDataResponse<SubcategoryResponse>> {
    return this.http
      .get<ApiDataResponse<SubcategoryResponse>>(`${ this.apiUrl }/${ id }`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  getSubcategoriesForSelect(
    categoryId?: number,
    name?: string
  ): Observable<ApiDataResponse<SubcategorySelectResponse[]>> {
    let httpParams = new HttpParams();

    if (categoryId !== undefined && categoryId !== null) {
      httpParams = httpParams.set('categoryId', categoryId.toString());
    }

    if (name !== undefined && name !== null && name.trim() !== '') {
      httpParams = httpParams.set('name', name.trim());
    }

    return this.http
      .get<ApiDataResponse<SubcategorySelectResponse[]>>(`${ this.apiUrl }/for-select`, {
        params: httpParams,
      })
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  createSubcategory(
    request: CreateSubcategoryRequest
  ): Observable<ApiDataResponse<SubcategoryResponse>> {
    return this.http
      .post<ApiDataResponse<SubcategoryResponse>>(this.apiUrl, request)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  updateSubcategory(
    id: number,
    request: UpdateSubcategoryRequest
  ): Observable<ApiDataResponse<SubcategoryResponse>> {
    return this.http
      .put<ApiDataResponse<SubcategoryResponse>>(`${ this.apiUrl }/${ id }`, request)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  activateSubcategory(id: number): Observable<ApiPlainResponse> {
    return this.http
      .put<ApiPlainResponse>(`${ this.apiUrl }/${ id }/activate`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  deactivateSubcategory(id: number): Observable<ApiPlainResponse> {
    return this.http
      .put<ApiPlainResponse>(`${ this.apiUrl }/${ id }/deactivate`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }
}
