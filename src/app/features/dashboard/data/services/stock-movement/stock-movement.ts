import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import {
  CreateStockAdjustmentRequest
} from '@features/dashboard/data/models/create-stock-adjustment-request.interface';
import { CreateStockEntryRequest } from '@features/dashboard/data/models/create-stock-entry-request.interface';
import { SearchStockMovementsParams } from '@features/dashboard/data/models/search-stock-movements-params.interface';
import {
  StockMovementCreatedResponse
} from '@features/dashboard/data/models/stock-movement-created-response.interface';
import { StockMovementDetailResponse } from '@features/dashboard/data/models/stock-movement-detail-response.interface';
import { StockMovementResponse } from '@features/dashboard/data/models/stock-movement-response.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StockMovementService {
  private readonly http = inject(HttpClient);
  private readonly httpParamsBuilder = inject(HttpParamsBuilderService);
  private readonly errorHandler = inject(HttpErrorHandlerService);
  private readonly apiUrl = `${ environment.apiUrl }/inventory-movement`;

  searchMovements(
    params: SearchStockMovementsParams = {}
  ): Observable<ApiDataResponse<ApiPaginatedResponse<StockMovementResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
    .get<ApiDataResponse<ApiPaginatedResponse<StockMovementResponse>>>(`${ this.apiUrl }/search`, {
      params: httpParams,
    })
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  getMovementById(id: number): Observable<ApiDataResponse<StockMovementDetailResponse>> {
    return this.http
    .get<ApiDataResponse<StockMovementDetailResponse>>(`${ this.apiUrl }/${ id }`)
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  createStockEntry(
    request: CreateStockEntryRequest
  ): Observable<ApiDataResponse<StockMovementCreatedResponse>> {
    return this.http
    .post<ApiDataResponse<StockMovementCreatedResponse>>(`${ this.apiUrl }`, request)
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }

  createStockAdjustment(
    request: CreateStockAdjustmentRequest
  ): Observable<ApiDataResponse<StockMovementCreatedResponse>> {
    return this.http
    .post<ApiDataResponse<StockMovementCreatedResponse>>(`${ this.apiUrl }/adjustment`, request)
    .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }
}
