import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { SearchSubcategoriesParams } from '@features/dashboard/data/models/search-subcategories-params.interface';
import { SubcategoryResponse } from '@features/dashboard/data/models/subcategory-response.interface';
import { ApiDataResponse } from '@shared/data/models/api-data-response.interface';
import { ApiPaginatedResponse } from '@shared/data/models/api-paginated-response.interface';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { HttpParamsBuilderService } from '@shared/services/http-params-builder.service';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Subcategory {
  private readonly http = inject(HttpClient);
  private readonly httpParamsBuilder = inject(HttpParamsBuilderService);
  private readonly errorHandler = inject(HttpErrorHandlerService);
  private readonly apiUrl = `${ environment.apiUrl }/subcategory-product`;

  searchSubcategories(
    params: SearchSubcategoriesParams = {}
  ): Observable<ApiDataResponse<ApiPaginatedResponse<SubcategoryResponse>>> {
    const httpParams = this.httpParamsBuilder.buildSearchParams(params);

    return this.http
      .get<ApiDataResponse<ApiPaginatedResponse<SubcategoryResponse>>>(`${ this.apiUrl }/search`, {
        params: httpParams,
      })
      .pipe(catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error)));
  }
}
