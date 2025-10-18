import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ProductResponse } from '@features/dashboard/data/models/product-response.interface';
import { SearchProductsParams } from '@features/dashboard/data/models/search-products-params.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Product {
  private readonly http = inject(HttpClient);
  private readonly httpParamsBuilder = inject(HttpParamsBuilderService);
  private readonly errorHandler = inject(HttpErrorHandlerService);
  private readonly apiUrl = `${ environment.apiUrl }/product`;

  searchProducts(
    params: SearchProductsParams = {}
  ): Observable<ApiDataResponse<ApiPaginatedResponse<ProductResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
    .get<ApiDataResponse<ApiPaginatedResponse<ProductResponse>>>(`${ this.apiUrl }/search`, {
      params: httpParams,
    })
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  findProductById(id: number): Observable<ApiDataResponse<ProductResponse>> {
    return this.http
    .get<ApiDataResponse<ProductResponse>>(`${ this.apiUrl }/${ id }`)
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

}
