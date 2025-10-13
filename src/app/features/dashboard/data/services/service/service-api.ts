import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { SearchServicesParams } from '@features/dashboard/data/models/search-services-params.interface';
import { ServiceResponse } from '@features/dashboard/data/models/service-response.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable, throwError } from 'rxjs';

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
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.errorHandler.handleError(error));
        })
      );
  }
}
