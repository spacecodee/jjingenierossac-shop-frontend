import { DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import {
  Component,
  computed,
  inject,
  LOCALE_ID,
  numberAttribute,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductResponse } from '@features/dashboard/data/models/product-response.interface';
import { SearchProductsParams } from '@features/dashboard/data/models/search-products-params.interface';
import { Product } from '@features/dashboard/data/services/product/product';
import { ProductSortField } from '@features/dashboard/data/types/product-sort-field.type';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideSlidersHorizontal,
  lucideTrash2,
  lucideX,
} from '@ng-icons/lucide';
import {
  ProductCategoryAutocomplete
} from '@shared/components/product-category-autocomplete/product-category-autocomplete';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { ActiveFilterType } from '@shared/data/types/active-filter.type';
import { SortDirection } from '@shared/data/types/sort-direction.type';
import { DateFormatterService } from '@shared/services/date-formatter.service';
import { PaginationHelperService } from '@shared/services/pagination-helper.service';
import { SearchListHelperService } from '@shared/services/search-list-helper.service';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { BrnTooltipImports } from '@spartan-ng/brain/tooltip';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDatePickerImports, provideHlmDatePickerConfig } from '@spartan-ng/helm/date-picker';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { toast } from 'ngx-sonner';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...BrnSelectImports,
    ...HlmSelectImports,
    ...HlmTableImports,
    ...HlmBadgeImports,
    ...HlmRadioGroupImports,
    ...HlmDatePickerImports,
    ...HlmPaginationImports,
    ...HlmIconImports,
    ...HlmInputImports,
    ...BrnAlertDialogImports,
    ...HlmAlertDialogImports,
    ...BrnTooltipImports,
    ...HlmTooltipImports,
    ...HlmSwitchImports,
    HlmLabel,
    NgIcon,
    HlmSpinner,
    HlmSeparator,
    HlmSkeleton,
    FormsModule,
    DatePipe,
    DecimalPipe,
    RouterLink,
    ProductCategoryAutocomplete,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-PE' },
    provideIcons({
      lucideSearch,
      lucideX,
      lucideSlidersHorizontal,
      lucideCalendar,
      lucidePlus,
      lucideRefreshCw,
      lucidePencil,
      lucideTrash2,
    }),
    provideHlmDatePickerConfig({
      formatDate: (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${ year }-${ month }-${ day }`;
      },
    }),
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit, OnDestroy {
  constructor() {
    registerLocaleData(localeEs, 'es-PE');
  }

  private readonly productService = inject(Product);
  private readonly paginationHelper = inject(PaginationHelperService);
  private readonly dateFormatter = inject(DateFormatterService);
  private readonly searchListHelper = inject(SearchListHelperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;

  readonly categoryAutocomplete = viewChild<ProductCategoryAutocomplete>('categoryAutocomplete');

  readonly Math = Math;

  readonly products = signal<ProductResponse[]>([]);
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
  readonly showDateFilters = signal<boolean>(false);
  readonly activeFilter = signal<ActiveFilterType>('all');
  readonly selectedCategoryId = signal<number | null>(null);
  readonly selectedSubcategoryId = signal<number | null>(null);

  readonly createdAfter = signal<Date | undefined>(undefined);
  readonly createdBefore = signal<Date | undefined>(undefined);
  readonly updatedAfter = signal<Date | undefined>(undefined);
  readonly updatedBefore = signal<Date | undefined>(undefined);

  readonly productToToggle = signal<ProductResponse | null>(null);
  readonly toggleAction = signal<'activate' | 'deactivate' | 'delete' | null>(null);
  readonly productIdBeingToggled = signal<number | null>(null);
  readonly isTogglingProduct = signal<boolean>(false);

  readonly productToDelete = signal<ProductResponse | null>(null);
  readonly isDeletingProduct = signal<boolean>(false);

  get activeFilterValue(): ActiveFilterType {
    return this.activeFilter();
  }

  set activeFilterValue(value: ActiveFilterType) {
    this.activeFilter.set(value);
  }

  readonly hasFiltersApplied = computed(() => {
    return (
      this.searchTerm() !== '' ||
      this.activeFilter() !== 'all' ||
      this.selectedCategoryId() !== null ||
      this.selectedSubcategoryId() !== null ||
      this.createdAfter() !== undefined ||
      this.createdBefore() !== undefined ||
      this.updatedAfter() !== undefined ||
      this.updatedBefore() !== undefined
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
    const params: SearchProductsParams = {
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

    this.searchListHelper.applyActiveFilter(params, this.activeFilter);

    const dateParams = this.dateFormatter.formatDateRangeParams({
      createdAfter: this.createdAfter(),
      createdBefore: this.createdBefore(),
      updatedAfter: this.updatedAfter(),
      updatedBefore: this.updatedBefore(),
    });

    Object.assign(params, dateParams);

    this.productService.searchProducts(params).subscribe({
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
          'No se pudieron cargar los productos'
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
    this.activeFilter.set('all');
    this.selectedCategoryId.set(null);
    this.selectedSubcategoryId.set(null);
    this.createdAfter.set(undefined);
    this.createdBefore.set(undefined);
    this.updatedAfter.set(undefined);
    this.updatedBefore.set(undefined);
    this.categoryAutocomplete()?.reset();
    this.isLoading.set(true);

    this.reloadFromPageZero();
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  toggleDateFilters(): void {
    this.showDateFilters.update((value) => !value);
  }

  onFilterActiveChange(filter: ActiveFilterType): void {
    this.activeFilter.set(filter);
    this.isLoading.set(true);

    this.reloadFromPageZero();
  }

  onCreatedAfterChange(date: Date): void {
    this.createdAfter.set(date);
    this.isLoading.set(true);

    this.reloadFromPageZero();
  }

  onCreatedBeforeChange(date: Date): void {
    this.createdBefore.set(date);
    this.isLoading.set(true);

    this.reloadFromPageZero();
  }

  onUpdatedAfterChange(date: Date): void {
    this.updatedAfter.set(date);
    this.isLoading.set(true);

    this.reloadFromPageZero();
  }

  onUpdatedBeforeChange(date: Date): void {
    this.updatedBefore.set(date);
    this.isLoading.set(true);

    this.reloadFromPageZero();
  }

  onCategorySelected(categoryId: number | null): void {
    const previousValue = this.selectedCategoryId();
    if (previousValue !== categoryId) {
      this.selectedCategoryId.set(categoryId);
      this.selectedSubcategoryId.set(null);
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

  onSort(field: ProductSortField): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('ASC');
    }
    this.isLoading.set(true);
    this.loadProducts();
  }

  private reloadFromPageZero(): void {
    if (this.currentPage() === 0) {
      this.loadProducts();
    } else {
      this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { page: 0 },
        queryParamsHandling: 'merge',
      })
      .then((r) => !r && undefined);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.isLoading.set(true);

    this.reloadFromPageZero();
  }

  onActivateAttempt(product: ProductResponse): void {
    if (!product.isActive) {
      this.productToToggle.set(product);
      this.toggleAction.set('activate');
      this.productIdBeingToggled.set(product.productId);
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onDeactivateAttempt(product: ProductResponse): void {
    if (product.isActive) {
      this.productToToggle.set(product);
      this.toggleAction.set('deactivate');
      this.productIdBeingToggled.set(product.productId);
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onDeleteAttempt(product: ProductResponse): void {
    if (!product.isActive) {
      this.productToDelete.set(product);
      this.productToToggle.set(product);
      this.toggleAction.set('delete');
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onCancelToggle(): void {
    this.productToToggle.set(null);
    this.toggleAction.set(null);
    this.productIdBeingToggled.set(null);
  }

  onConfirmToggle(closeDialog: () => void): void {
    const product = this.productToToggle();
    const action = this.toggleAction();

    if (!product || !action) {
      return;
    }

    if (action === 'delete') {
      this.isDeletingProduct.set(true);

      this.productService.deleteProduct(product.productId).subscribe({
        next: (response) => {
          this.products.update((products) =>
            products.filter((p) => p.productId !== product.productId)
          );

          this.totalElements.update((total) => Math.max(0, total - 1));

          toast.success('Producto eliminado', {
            description: response.message,
          });

          this.isDeletingProduct.set(false);
          this.productToDelete.set(null);
          this.toggleAction.set(null);
          this.productIdBeingToggled.set(null);
          closeDialog();

          if (this.products().length === 0 && this.currentPage() > 0) {
            this.router
            .navigate([], {
              relativeTo: this.route,
              queryParams: { page: this.currentPage() - 1 },
              queryParamsHandling: 'merge',
            })
            .then((r) => !r && undefined);
          }
        },
        error: (error: ApiErrorResponse) => {
          this.isDeletingProduct.set(false);
          this.productToDelete.set(null);
          this.toggleAction.set(null);
          this.productIdBeingToggled.set(null);
          closeDialog();

          toast.error('Error al eliminar producto', {
            description: error.message,
          });
        },
      });

      return;
    }

    this.isTogglingProduct.set(true);

    const productCall =
      action === 'activate'
        ? this.productService.activateProduct(product.productId)
        : this.productService.deactivateProduct(product.productId);

    const newState = action === 'activate';
    const successMessage = action === 'activate' ? 'Producto activado' : 'Producto desactivado';
    const errorMessage =
      action === 'activate' ? 'Error al activar producto' : 'Error al desactivar producto';

    productCall.subscribe({
      next: (response) => {
        this.products.update((products) =>
          products.map((p) =>
            p.productId === product.productId ? { ...p, isActive: newState } : p
          )
        );

        toast.success(successMessage, {
          description: response.message,
        });

        this.isTogglingProduct.set(false);
        this.productToToggle.set(null);
        this.toggleAction.set(null);
        this.productIdBeingToggled.set(null);
        closeDialog();
      },
      error: (error: ApiErrorResponse) => {
        this.isTogglingProduct.set(false);
        this.productToToggle.set(null);
        this.toggleAction.set(null);
        this.productIdBeingToggled.set(null);
        closeDialog();

        toast.error(errorMessage, {
          description: error.message,
        });
      },
    });
  }
}
