import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { PublicServiceDetailResponse } from '@features/public/data/models/public-service-detail-response.interface';
import { PublicServiceResponse } from '@features/public/data/models/public-service-response';
import { SearchPublicServicesParams } from '@features/public/data/models/search-public-services-params';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

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

  getPublicServiceById(id: number): Observable<ApiDataResponse<PublicServiceDetailResponse>> {
    return this.http
      .get<ApiDataResponse<PublicServiceDetailResponse>>(`${ this.apiUrl }/${ id }`)
      .pipe(catchError(this.errorHandler.handleError));
  }
}
