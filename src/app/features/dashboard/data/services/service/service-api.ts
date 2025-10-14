import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { CreateServiceRequest } from '@features/dashboard/data/models/create-service-request.interface';
import { SearchServicesParams } from '@features/dashboard/data/models/search-services-params.interface';
import { ServiceResponse } from '@features/dashboard/data/models/service-response.interface';
import { UpdateServiceRequest } from '@features/dashboard/data/models/update-service-request.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceApiService {
  private readonly http = inject(HttpClient);
  private readonly httpParamsBuilder = inject(HttpParamsBuilderService);
  private readonly errorHandler = inject(HttpErrorHandlerService);
  private readonly apiUrl = `${ environment.apiUrl }/service`;

  searchServices(
    params: SearchServicesParams = {}
  ): Observable<ApiDataResponse<ApiPaginatedResponse<ServiceResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
      .get<ApiDataResponse<ApiPaginatedResponse<ServiceResponse>>>(`${ this.apiUrl }/search`, {
        params: httpParams,
      })
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  createService(request: CreateServiceRequest): Observable<ApiDataResponse<ServiceResponse>> {
    return this.http
      .post<ApiDataResponse<ServiceResponse>>(this.apiUrl, request)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  findServiceById(id: number): Observable<ApiDataResponse<ServiceResponse>> {
    return this.http
      .get<ApiDataResponse<ServiceResponse>>(`${ this.apiUrl }/${ id }`)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  updateService(
    id: number,
    request: UpdateServiceRequest
  ): Observable<ApiDataResponse<ServiceResponse>> {
    return this.http
      .put<ApiDataResponse<ServiceResponse>>(`${ this.apiUrl }/${ id }`, request)
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  activateService(id: number): Observable<ApiDataResponse<ServiceResponse>> {
    return this.http
      .put<ApiDataResponse<ServiceResponse>>(`${ this.apiUrl }/${ id }/activate`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  deactivateService(id: number): Observable<ApiDataResponse<ServiceResponse>> {
    return this.http
      .put<ApiDataResponse<ServiceResponse>>(`${ this.apiUrl }/${ id }/deactivate`, {})
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }
}
