import {
  Component,
  computed,
  inject,
  numberAttribute,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublicServiceResponse } from '@features/public/data/models/public-service-response';
import { SearchPublicServicesParams } from '@features/public/data/models/search-public-services-params';
import { PublicServiceApiService } from '@features/public/data/services/public-service/public-service-api';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
  lucideClock,
  lucideLightbulb,
  lucideRefreshCw,
  lucideSearch,
  lucideSlidersHorizontal,
  lucideX,
} from '@ng-icons/lucide';
import {
  ServiceCategoryAutocomplete
} from '@shared/components/service-category-autocomplete/service-category-autocomplete';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { PaginationHelperService } from '@shared/services/pagination-helper.service';
import { SearchListHelperService } from '@shared/services/search-list-helper.service';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-public-service-list',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...BrnSelectImports,
    ...HlmSelectImports,
    ServiceCategoryAutocomplete,
    ...HlmBadgeImports,
    ...HlmPaginationImports,
    ...HlmIconImports,
    ...HlmInputImports,
    HlmLabel,
    NgIcon,
    HlmSpinner,
    HlmSkeleton,
    FormsModule,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideSearch,
      lucideX,
      lucideSlidersHorizontal,
      lucideRefreshCw,
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronsLeft,
      lucideChevronsRight,
      lucideLightbulb,
      lucideClock,
    }),
  ],
  templateUrl: './public-service-list.html',
})
export class PublicServiceList implements OnInit, OnDestroy {
  private readonly publicServiceApi = inject(PublicServiceApiService);
  private readonly paginationHelper = inject(PaginationHelperService);
  private readonly searchListHelper = inject(SearchListHelperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;

  readonly Math = Math;

  readonly services = signal<PublicServiceResponse[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isRefreshing = signal<boolean>(false);

  private readonly _pageQuery = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => {
        const pageQuery = params.get('page');
        return pageQuery ? numberAttribute(pageQuery, 0) : undefined;
      })
    )
  );

  readonly currentPage = computed(() => this._pageQuery() ?? 0);
  readonly pageSize = signal<number>(12);
  readonly totalPages = signal<number>(0);
  readonly totalElements = signal<number>(0);
  readonly isFirst = signal<boolean>(true);
  readonly isLast = signal<boolean>(true);

  readonly searchName = signal<string>('');
  readonly searchInputValue = signal<string>('');

  readonly showFilters = signal<boolean>(false);
  readonly selectedServiceCategoryId = signal<number | null>(null);

  readonly hasFiltersApplied = computed(() => {
    return this.searchName() !== '' || this.selectedServiceCategoryId() !== null;
  });

  readonly displayedServices = computed(() => {
    if (this.isLoading()) {
      return [];
    }
    return this.services();
  });

  readonly pageNumbers = computed(() => {
    return this.paginationHelper.generatePageNumbers(this.currentPage(), this.totalPages());
  });

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(map((params) => params.get('category')))
      .subscribe((categoryId) => {
        if (categoryId && !Number.isNaN(+categoryId) && +categoryId > 0) {
          this.handleCategoryFromUrl(+categoryId);
        }
      });

    this.searchSubscription = this.searchSubject.pipe(debounceTime(600)).subscribe((searchTerm) => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        this.searchName.set(searchTerm);
        this.reloadFromPageZero();
      }
    });

    this.queryParamsSubscription = this.route.queryParamMap
      .pipe(
        map((params) => params.get('page')),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.isLoading.set(true);
        this.loadServices();
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
  }

  loadServices(): void {
    const params: SearchPublicServicesParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy: 'name',
      sortDirection: 'ASC',
    };

    if (this.searchName()) {
      params.name = this.searchName();
    }

    if (this.selectedServiceCategoryId() !== null) {
      params.serviceCategoryId = this.selectedServiceCategoryId()!;
    }

    this.publicServiceApi.listPublicServices(params).subscribe({
      next: (response) => {
        this.searchListHelper.handlePaginatedResponse(response.data, this.services, {
          totalPages: this.totalPages,
          totalElements: this.totalElements,
          isFirst: this.isFirst,
          isLast: this.isLast,
          isLoading: this.isLoading,
          isRefreshing: this.isRefreshing,
        });
      },
      error: (error: ApiErrorResponse) => {
        this.searchListHelper.handleSearchError(
          error,
          {
            totalPages: this.totalPages,
            totalElements: this.totalElements,
            isFirst: this.isFirst,
            isLast: this.isLast,
            isLoading: this.isLoading,
            isRefreshing: this.isRefreshing,
          },
          'Error al cargar servicios públicos',
          'No se pudieron cargar los servicios'
        );
      },
    });
  }

  onSearchInput(value: string): void {
    this.searchInputValue.set(value);
    this.searchSubject.next(value);
  }

  onClearSearch(): void {
    this.searchInputValue.set('');
    this.searchName.set('');
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  onRefresh(): void {
    this.isRefreshing.set(true);
    this.loadServices();
  }

  onClearFilters(): void {
    this.searchInputValue.set('');
    this.searchName.set('');
    this.selectedServiceCategoryId.set(null);
    this.isLoading.set(true);

    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { category: null },
        queryParamsHandling: 'merge',
      })
      .then((r) => !r && undefined);

    this.reloadFromPageZero();
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  onCategorySelected(categoryId: number | null): void {
    const previousValue = this.selectedServiceCategoryId();
    if (previousValue !== categoryId) {
      this.selectedServiceCategoryId.set(categoryId);
      this.router
        .navigate([], {
          relativeTo: this.route,
          queryParams: { category: categoryId },
          queryParamsHandling: 'merge',
        })
        .then((r) => !r && undefined);
      this.isLoading.set(true);
      this.reloadFromPageZero();
    }
  }

  handleCategoryFromUrl(categoryId: number): void {
    this.selectedServiceCategoryId.set(categoryId);
    this.showFilters.set(true);
    this.isLoading.set(true);
    this.loadServices();
  }

  goToPage(page: number): void {
    if (page >= 0 && page !== this.currentPage()) {
      this.router
        .navigate([], {
          relativeTo: this.route,
          queryParams: { page },
          queryParamsHandling: 'merge',
        })
        .then((r) => !r && undefined);
    }
  }

  private reloadFromPageZero(): void {
    if (this.currentPage() === 0) {
      this.loadServices();
    } else {
      this.goToPage(0);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }
}
