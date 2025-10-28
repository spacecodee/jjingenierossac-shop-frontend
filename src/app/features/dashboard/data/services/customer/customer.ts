import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { CustomerDetailResponse } from '@features/dashboard/data/models/customer-detail-response.interface';
import { CustomerResponse } from '@features/dashboard/data/models/customer-response.interface';
import { SearchCustomersParams } from '@features/dashboard/data/models/search-customers-params.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Customer {
  private readonly http = inject(HttpClient);
  private readonly httpParamsBuilder = inject(HttpParamsBuilderService);
  private readonly errorHandler = inject(HttpErrorHandlerService);
  private readonly apiUrl = `${ environment.apiUrl }/user/customer`;

  searchCustomers(
    params: SearchCustomersParams = {}
  ): Observable<ApiDataResponse<ApiPaginatedResponse<CustomerResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
    .get<ApiDataResponse<ApiPaginatedResponse<CustomerResponse>>>(`${ this.apiUrl }/search`, {
      params: httpParams,
    })
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  findCustomerById(id: number): Observable<ApiDataResponse<CustomerDetailResponse>> {
    return this.http
    .get<ApiDataResponse<CustomerDetailResponse>>(`${ this.apiUrl }/${ id }`)
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }
}
