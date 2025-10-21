import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { CreateSupplierRequest } from '@features/dashboard/data/models/create-supplier-request.interface';
import { SearchSuppliersParams } from '@features/dashboard/data/models/search-suppliers-params.interface';
import { SupplierResponse } from '@features/dashboard/data/models/supplier-response.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
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
  private readonly apiUrl = `${ environment.apiUrl }/supplier`;

  searchSuppliers(
    params: SearchSuppliersParams = {}
  ): Observable<ApiDataResponse<ApiPaginatedResponse<SupplierResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
    .get<ApiDataResponse<ApiPaginatedResponse<SupplierResponse>>>(`${ this.apiUrl }/search`, {
      params: httpParams,
    })
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  createSupplier(request: CreateSupplierRequest): Observable<ApiDataResponse<SupplierResponse>> {
    return this.http
    .post<ApiDataResponse<SupplierResponse>>(this.apiUrl, request)
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }
}
