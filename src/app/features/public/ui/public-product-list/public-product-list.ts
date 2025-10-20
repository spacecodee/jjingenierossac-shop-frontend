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
import { PublicProductResponse } from '@features/public/data/models/public-product-response.interface';
import { SearchPublicProductsParams } from '@features/public/data/models/search-public-products-params.interface';
import { PublicProductApi } from '@features/public/data/services/public-product/public-product-api';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
  lucidePackage,
  lucideRefreshCw,
  lucideSearch,
  lucideShoppingCart,
  lucideSlidersHorizontal,
  lucideTag,
  lucideX,
} from '@ng-icons/lucide';
import {
  ProductCategoryAutocomplete
} from '@shared/components/product-category-autocomplete/product-category-autocomplete';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { SortDirection } from '@shared/data/types/sort-direction.type';
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

type ProductSortField = 'price' | 'name' | 'createdAt';

@Component({
  selector: 'app-public-product-list',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...BrnSelectImports,
    ...HlmSelectImports,
    ProductCategoryAutocomplete,
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
      lucidePackage,
      lucideTag,
      lucideShoppingCart,
    }),
  ],
  templateUrl: './public-product-list.html',
})
export class PublicProductList implements OnInit, OnDestroy {
  private readonly publicProductApi = inject(PublicProductApi);
  private readonly paginationHelper = inject(PaginationHelperService);
  private readonly searchListHelper = inject(SearchListHelperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;

  readonly Math = Math;

  readonly products = signal<PublicProductResponse[]>([]);
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
  readonly pageSize = signal<number>(20);
  readonly totalPages = signal<number>(0);
  readonly totalElements = signal<number>(0);
  readonly isFirst = signal<boolean>(true);
  readonly isLast = signal<boolean>(true);

  readonly searchTerm = signal<string>('');
  readonly searchInputValue = signal<string>('');
  readonly sortField = signal<ProductSortField>('createdAt');
  readonly sortDirection = signal<SortDirection>('DESC');

  readonly showFilters = signal<boolean>(false);
  readonly selectedCategoryId = signal<number | null>(null);
  readonly selectedSubcategoryId = signal<number | null>(null);
  readonly minPrice = signal<number | undefined>(undefined);
  readonly maxPrice = signal<number | undefined>(undefined);

  readonly hasFiltersApplied = computed(() => {
    return (
      this.searchTerm() !== '' ||
      this.selectedCategoryId() !== null ||
      this.selectedSubcategoryId() !== null ||
      this.minPrice() !== undefined ||
      this.maxPrice() !== undefined
    );
  });

  readonly displayedProducts = computed(() => {
    if (this.isLoading()) {
      return [];
    }
    return this.products();
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

    this.searchSubscription = this.searchSubject.pipe(debounceTime(300)).subscribe((searchTerm) => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        this.searchTerm.set(searchTerm);
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
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
  }

  loadProducts(): void {
    const params: SearchPublicProductsParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy: this.sortField(),
      sortDirection: this.sortDirection(),
    };

    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }

    if (this.selectedCategoryId() !== null) {
      params.categoryId = this.selectedCategoryId()!;
    }

    if (this.selectedSubcategoryId() !== null) {
      params.subcategoryId = this.selectedSubcategoryId()!;
    }

    if (this.minPrice() !== undefined) {
      params.minPrice = this.minPrice();
    }

    if (this.maxPrice() !== undefined) {
      params.maxPrice = this.maxPrice();
    }

    this.publicProductApi.listPublicProducts(params).subscribe({
      next: (response) => {
        this.searchListHelper.handlePaginatedResponse(response.data, this.products, {
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
          'Error al cargar productos',
          'No se pudieron cargar los productos del catálogo'
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
    this.searchTerm.set('');
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  onRefresh(): void {
    this.isRefreshing.set(true);
    this.loadProducts();
  }

  onClearFilters(): void {
    this.searchInputValue.set('');
    this.searchTerm.set('');
    this.selectedCategoryId.set(null);
    this.selectedSubcategoryId.set(null);
    this.minPrice.set(undefined);
    this.maxPrice.set(undefined);
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
    const previousValue = this.selectedCategoryId();
    if (previousValue !== categoryId) {
      this.selectedCategoryId.set(categoryId);
      this.selectedSubcategoryId.set(null);
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

  onSubcategorySelected(subcategoryId: number | null): void {
    const previousValue = this.selectedSubcategoryId();
    if (previousValue !== subcategoryId) {
      this.selectedSubcategoryId.set(subcategoryId);
      this.isLoading.set(true);
      this.reloadFromPageZero();
    }
  }

  onSortChange(value: string | string[] | undefined): void {
    if (!value || Array.isArray(value)) return;
    const [field, direction] = value.split(':') as [ProductSortField, SortDirection];
    this.sortField.set(field);
    this.sortDirection.set(direction);
    this.isLoading.set(true);
    this.loadProducts();
  }

  onMinPriceChange(value: string): void {
    const price = value ? Number.parseFloat(value) : undefined;
    this.minPrice.set(price);
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  onMaxPriceChange(value: string): void {
    const price = value ? Number.parseFloat(value) : undefined;
    this.maxPrice.set(price);
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  handleCategoryFromUrl(categoryId: number): void {
    this.selectedCategoryId.set(categoryId);
    this.showFilters.set(true);
    this.isLoading.set(true);
    this.loadProducts();
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
      this.loadProducts();
    } else {
      this.goToPage(0);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  formatPrice(price: number): string {
    return `$${ price.toFixed(2) }`;
  }
}
