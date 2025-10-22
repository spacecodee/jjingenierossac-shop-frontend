import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { CreateSupplierRequest } from '@features/dashboard/data/models/create-supplier-request.interface';
import { SearchSuppliersParams } from '@features/dashboard/data/models/search-suppliers-params.interface';
import { SupplierResponse } from '@features/dashboard/data/models/supplier-response.interface';
import { SupplierSelectResponse } from '@features/dashboard/data/models/supplier-select-response.interface';
import { UpdateSupplierRequest } from '@features/dashboard/data/models/update-supplier-request.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { ApiPlainResponse } from '@shared/data/models/api-plain-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Supplier {
  private readonly http = inject(HttpClient);
  private readonly httpParamsBuilder = inject(HttpParamsBuilderService);
  private readonly errorHandler = inject(HttpErrorHandlerService);
  private readonly apiUrl = `${environment.apiUrl}/supplier`;

  searchSuppliers(
    params: SearchSuppliersParams = {}
  ): Observable<ApiDataResponse<ApiPaginatedResponse<SupplierResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
      .get<ApiDataResponse<ApiPaginatedResponse<SupplierResponse>>>(`${this.apiUrl}/search`, {
        params: httpParams,
      })
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  getSupplierById(id: number): Observable<ApiDataResponse<SupplierResponse>> {
    return this.http
      .get<ApiDataResponse<SupplierResponse>>(`${this.apiUrl}/${id}`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  createSupplier(request: CreateSupplierRequest): Observable<ApiDataResponse<SupplierResponse>> {
    return this.http
      .post<ApiDataResponse<SupplierResponse>>(this.apiUrl, request)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  getSuppliersForSelect(
    name?: string,
    taxId?: string
  ): Observable<ApiDataResponse<SupplierSelectResponse[]>> {
    let httpParams = new HttpParams();

    if (name !== undefined && name !== null && name.trim() !== '') {
      httpParams = httpParams.set('name', name.trim());
    }

    if (taxId !== undefined && taxId !== null && taxId.trim() !== '') {
      httpParams = httpParams.set('taxId', taxId.trim());
    }

    return this.http
      .get<ApiDataResponse<SupplierSelectResponse[]>>(`${this.apiUrl}/for-select`, {
        params: httpParams,
      })
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  updateSupplier(
    id: number,
    request: UpdateSupplierRequest
  ): Observable<ApiDataResponse<SupplierResponse>> {
    return this.http
      .put<ApiDataResponse<SupplierResponse>>(`${this.apiUrl}/${id}`, request)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  activateSupplier(id: number): Observable<ApiPlainResponse> {
    return this.http
      .put<ApiPlainResponse>(`${this.apiUrl}/${id}/activate`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  deactivateSupplier(id: number): Observable<ApiPlainResponse> {
    return this.http
      .put<ApiPlainResponse>(`${this.apiUrl}/${id}/deactivate`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }
}
