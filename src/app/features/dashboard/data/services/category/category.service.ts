import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { CategoryResponse } from '@features/dashboard/data/models/category-response.interface';
import { CategorySelectResponse } from '@features/dashboard/data/models/category-select-response.interface';
import { CreateCategoryRequest } from '@features/dashboard/data/models/create-category-request.interface';
import { SearchCategoriesParams } from '@features/dashboard/data/models/search-categories-params.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { ApiPlainResponse } from '@shared/data/models/api-plain-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly httpParamsBuilder = inject(HttpParamsBuilderService);
  private readonly errorHandler = inject(HttpErrorHandlerService);
  private readonly apiUrl = `${ environment.apiUrl }/category-product`;

  searchCategories(
    params: SearchCategoriesParams = {}
  ): Observable<ApiDataResponse<ApiPaginatedResponse<CategoryResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
      .get<ApiDataResponse<ApiPaginatedResponse<CategoryResponse>>>(`${ this.apiUrl }/search`, {
        params: httpParams,
      })
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  getCategoryById(id: number): Observable<ApiDataResponse<CategoryResponse>> {
    return this.http
      .get<ApiDataResponse<CategoryResponse>>(`${ this.apiUrl }/${ id }`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  createCategory(request: CreateCategoryRequest): Observable<ApiDataResponse<CategoryResponse>> {
    return this.http
      .post<ApiDataResponse<CategoryResponse>>(this.apiUrl, request)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  getCategoriesForSelect(name?: string): Observable<ApiDataResponse<CategorySelectResponse[]>> {
    let httpParams = new HttpParams();

    if (name !== undefined && name !== null && name.trim() !== '') {
      httpParams = httpParams.set('name', name.trim());
    }

    return this.http
      .get<ApiDataResponse<CategorySelectResponse[]>>(`${ this.apiUrl }/for-select`, {
        params: httpParams,
      })
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  activateCategory(id: number): Observable<ApiPlainResponse> {
    return this.http
      .put<ApiPlainResponse>(`${ this.apiUrl }/${ id }/activate`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  deactivateCategory(id: number): Observable<ApiPlainResponse> {
    return this.http
      .put<ApiPlainResponse>(`${ this.apiUrl }/${ id }/deactivate`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  deleteCategory(id: number): Observable<ApiPlainResponse> {
    return this.http
      .delete<ApiPlainResponse>(`${ this.apiUrl }/${ id }`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }
}
