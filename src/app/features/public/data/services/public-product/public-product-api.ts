import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { PublicProductResponse } from '@features/public/data/models/public-product-response.interface';
import { SearchPublicProductsParams } from '@features/public/data/models/search-public-products-params.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PublicProductApi {
  private readonly http = inject(HttpClient);
  private readonly httpParamsBuilder = inject(HttpParamsBuilderService);
  private readonly errorHandler = inject(HttpErrorHandlerService);
  private readonly apiUrl = `${ environment.apiUrl }/product/public`;

  listPublicProducts(
    params: SearchPublicProductsParams
  ): Observable<ApiDataResponse<ApiPaginatedResponse<PublicProductResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
    .get<ApiDataResponse<ApiPaginatedResponse<PublicProductResponse>>>(this.apiUrl, {
      params: httpParams,
    })
    .pipe(catchError(this.errorHandler.handleError));
  }

  getPublicProductById(id: number): Observable<ApiDataResponse<PublicProductResponse>> {
    return this.http
    .get<ApiDataResponse<PublicProductResponse>>(`${ this.apiUrl }/${ id }`)
    .pipe(catchError(this.errorHandler.handleError));
  }
}
