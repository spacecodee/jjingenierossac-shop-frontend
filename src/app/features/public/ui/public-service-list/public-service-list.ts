import { Component, computed, inject, numberAttribute, OnDestroy, OnInit, signal, } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceCategoryOption } from '@features/dashboard/data/models/service-category-option.interface';
import { ServiceCategoryService } from '@features/dashboard/data/services/service-category/service-category.service';
import { PublicServiceResponse } from '@features/public/data/models/public-service-response';
import { SearchPublicServicesParams } from '@features/public/data/models/search-public-services-params';
import { PublicServiceApiService } from '@features/public/data/services/public-service/public-service-api';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
  lucideRefreshCw,
  lucideSearch,
  lucideSlidersHorizontal,
  lucideX,
} from '@ng-icons/lucide';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { PaginationHelperService } from '@shared/services/pagination-helper.service';
import { SearchListHelperService } from '@shared/services/search-list-helper.service';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmAutocomplete } from '@spartan-ng/helm/autocomplete';
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
import { toast } from 'ngx-sonner';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-public-service-list',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...BrnSelectImports,
    ...HlmSelectImports,
    HlmAutocomplete,
    ...HlmBadgeImports,
    ...HlmPaginationImports,
    ...HlmIconImports,
    ...HlmInputImports,
    HlmLabel,
    NgIcon,
    HlmSpinner,
    HlmSkeleton,
    FormsModule,
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
    }),
  ],
  templateUrl: './public-service-list.html',
})
export class PublicServiceList implements OnInit, OnDestroy {
  private readonly publicServiceApi = inject(PublicServiceApiService);
  private readonly serviceCategoryService = inject(ServiceCategoryService);
  private readonly paginationHelper = inject(PaginationHelperService);
  private readonly searchListHelper = inject(SearchListHelperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();
  private readonly publicCategorySearchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private publicCategorySearchSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;

  readonly Math = Math;

  readonly services = signal<PublicServiceResponse[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isRefreshing = signal<boolean>(false);

  readonly serviceCategories = signal<ServiceCategoryOption[]>([]);
  readonly isLoadingCategories = signal<boolean>(false);
  publicServiceCategorySearch = signal<string>('');
  readonly publicServiceCategoryNames = computed(() => this.serviceCategories().map((c) => c.name));

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
    this.loadPublicServiceCategories();

    this.searchSubscription = this.searchSubject.pipe(debounceTime(600)).subscribe((searchTerm) => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        this.searchName.set(searchTerm);
        this.reloadFromPageZero();
      }
    });

    this.publicCategorySearchSubscription = this.publicCategorySearchSubject
      .pipe(debounceTime(500))
      .subscribe((searchTerm) => {
        if (searchTerm.length >= 3 || searchTerm.length === 0) {
          this.loadPublicServiceCategories(searchTerm);
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
    this.publicCategorySearchSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
  }

  loadPublicServiceCategories(name?: string): void {
    this.isLoadingCategories.set(true);
    this.serviceCategoryService.getServiceCategoriesForSelect(name).subscribe({
      next: (response) => {
        this.serviceCategories.set(response.data);
        this.isLoadingCategories.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoadingCategories.set(false);
        toast.error('Error al cargar categorías públicas', {
          description: error.message || 'No se pudieron cargar las categorías de servicio',
        });
      },
    });
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
    this.publicServiceCategorySearch.set('');
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  onPublicServiceCategorySelect(categoryPublicName: string | null): void {
    if (categoryPublicName) {
      const category = this.serviceCategories().find((c) => c.name === categoryPublicName);
      if (category) {
        this.selectedServiceCategoryId.set(category.serviceCategoryId);
        this.isLoading.set(true);
        this.reloadFromPageZero();
      }
    } else {
      const previousValue = this.selectedServiceCategoryId();
      if (previousValue !== null) {
        this.selectedServiceCategoryId.set(null);
        this.isLoading.set(true);
        this.reloadFromPageZero();
      }
    }
  }

  onPublicServiceCategorySearchChange(searchTerm: string): void {
    this.publicServiceCategorySearch.set(searchTerm);
    this.publicCategorySearchSubject.next(searchTerm);
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
