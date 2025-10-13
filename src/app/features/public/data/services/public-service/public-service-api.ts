import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { PublicServiceResponse } from '@features/public/data/models/public-service-response';
import { SearchPublicServicesParams } from '@features/public/data/models/search-public-services-params';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicServiceApiService {
  private readonly http = inject(HttpClient);
  private readonly httpParamsBuilder = inject(HttpParamsBuilderService);
  private readonly errorHandler = inject(HttpErrorHandlerService);
  private readonly apiUrl = `${ environment.apiUrl }/service/public`;

  listPublicServices(
    params: SearchPublicServicesParams
  ): Observable<ApiDataResponse<ApiPaginatedResponse<PublicServiceResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
      .get<ApiDataResponse<ApiPaginatedResponse<PublicServiceResponse>>>(this.apiUrl, {
        params: httpParams,
      })
      .pipe(catchError(this.errorHandler.handleError));
  }
}
