import { DatePipe, registerLocaleData } from '@angular/common';
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
import { MovementType } from '@features/dashboard/data/models/movement-type.enum';
import { QuantityType } from '@features/dashboard/data/models/quantity-type.enum';
import { SearchStockMovementsParams } from '@features/dashboard/data/models/search-stock-movements-params.interface';
import { StockMovementResponse } from '@features/dashboard/data/models/stock-movement-response.interface';
import { StockMovementService } from '@features/dashboard/data/services/stock-movement/stock-movement';
import { StockMovementSortField } from '@features/dashboard/data/types/stock-movement-sort-field.type';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePlus,
  lucideCalendar,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
  lucideEye,
  lucideRefreshCw,
  lucideSearch,
  lucideSlidersHorizontal,
  lucideX,
} from '@ng-icons/lucide';
import { MovementTypeSelect } from '@shared/components/movement-type-select/movement-type-select';
import { ProductAutocomplete } from '@shared/components/product-autocomplete/product-autocomplete';
import { QuantityTypeSelect } from '@shared/components/quantity-type-select/quantity-type-select';
import { SupplierAutocomplete } from '@shared/components/supplier-autocomplete/supplier-autocomplete';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { SortDirection } from '@shared/data/types/sort-direction.type';
import { DateFormatterService } from '@shared/services/date-formatter.service';
import { PaginationHelperService } from '@shared/services/pagination-helper.service';
import { SearchListHelperService } from '@shared/services/search-list-helper.service';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { BrnTooltipImports } from '@spartan-ng/brain/tooltip';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDatePickerImports, provideHlmDatePickerConfig } from '@spartan-ng/helm/date-picker';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-movement-list',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...BrnTooltipImports,
    ...BrnSelectImports,
    ...HlmSelectImports,
    ...HlmTableImports,
    ...HlmBadgeImports,
    ...HlmDatePickerImports,
    ...HlmPaginationImports,
    ...HlmIconImports,
    ...HlmInputImports,
    NgIcon,
    HlmSpinner,
    HlmSeparator,
    HlmSkeleton,
    FormsModule,
    DatePipe,
    ProductAutocomplete,
    SupplierAutocomplete,
    MovementTypeSelect,
    QuantityTypeSelect,
    RouterLink,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-PE' },
    provideIcons({
      lucidePlus,
      lucideSearch,
      lucideX,
      lucideSlidersHorizontal,
      lucideCalendar,
      lucideRefreshCw,
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronsLeft,
      lucideChevronsRight,
      lucideEye,
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
  templateUrl: './movement-list.html',
})
export class MovementList implements OnInit, OnDestroy {
  constructor() {
    registerLocaleData(localeEs, 'es-PE');
  }

  private readonly movementService = inject(StockMovementService);
  private readonly paginationHelper = inject(PaginationHelperService);
  private readonly dateFormatter = inject(DateFormatterService);
  private readonly searchListHelper = inject(SearchListHelperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;

  readonly Math = Math;

  readonly productAutocomplete = viewChild<ProductAutocomplete>(ProductAutocomplete);
  readonly supplierAutocomplete = viewChild<SupplierAutocomplete>(SupplierAutocomplete);
  readonly movementTypeSelect = viewChild<MovementTypeSelect>(MovementTypeSelect);
  readonly quantityTypeSelect = viewChild<QuantityTypeSelect>(QuantityTypeSelect);

  readonly movements = signal<StockMovementResponse[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isRefreshing = signal<boolean>(false);

  readonly selectedProductId = signal<number | null>(null);
  readonly selectedSupplierId = signal<number | null>(null);
  readonly selectedMovementType = signal<MovementType | null>(null);
  readonly selectedQuantityType = signal<QuantityType | null>(null);

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
  readonly sortField = signal<StockMovementSortField>('createdAt');
  readonly sortDirection = signal<SortDirection>('DESC');

  readonly showFilters = signal<boolean>(false);
  readonly showDateFilters = signal<boolean>(false);

  readonly dateFrom = signal<Date | undefined>(undefined);
  readonly dateTo = signal<Date | undefined>(undefined);

  readonly hasFiltersApplied = computed(() => {
    return (
      this.searchTerm() !== '' ||
      this.selectedProductId() !== null ||
      this.selectedSupplierId() !== null ||
      this.selectedMovementType() !== null ||
      this.selectedQuantityType() !== null ||
      this.dateFrom() !== undefined ||
      this.dateTo() !== undefined
    );
  });

  readonly displayedMovements = computed(() => {
    if (this.isLoading()) {
      return [];
    }
    return this.movements();
  });

  readonly pageNumbers = computed(() => {
    return this.paginationHelper.generatePageNumbers(this.currentPage(), this.totalPages());
  });

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(debounceTime(300)).subscribe((searchTerm) => {
      this.searchTerm.set(searchTerm);
      this.reloadFromPageZero();
    });

    this.queryParamsSubscription = this.route.queryParamMap
    .pipe(
      map((params) => params.get('page')),
      distinctUntilChanged()
    )
    .subscribe(() => {
      this.isLoading.set(true);
      this.loadMovements();
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
  }

  loadMovements(): void {
    const params: SearchStockMovementsParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy: this.sortField(),
      sortDirection: this.sortDirection(),
    };

    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }

    if (this.selectedProductId() !== null) {
      params.productId = this.selectedProductId() as number;
    }

    if (this.selectedSupplierId() !== null) {
      params.supplierId = this.selectedSupplierId() as number;
    }

    if (this.selectedMovementType() !== null) {
      params.movementType = [this.selectedMovementType() as MovementType];
    }

    if (this.selectedQuantityType() !== null) {
      params.quantityType = this.selectedQuantityType() as QuantityType;
    }

    const dateParams = this.dateFormatter.formatDateRangeParams({
      createdAfter: this.dateFrom(),
      createdBefore: this.dateTo(),
    });

    if (dateParams.createdAtAfter) {
      params.dateFrom = dateParams.createdAtAfter;
    }

    if (dateParams.createdAtBefore) {
      params.dateTo = dateParams.createdAtBefore;
    }

    this.movementService.searchMovements(params).subscribe({
      next: (response) => {
        this.searchListHelper.handlePaginatedResponse(response.data, this.movements, {
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
          'Error al cargar movimientos',
          'No se pudieron cargar los movimientos de inventario'
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
    this.loadMovements();
  }

  onClearFilters(): void {
    this.searchInputValue.set('');
    this.searchTerm.set('');
    this.selectedProductId.set(null);
    this.selectedSupplierId.set(null);
    this.selectedMovementType.set(null);
    this.selectedQuantityType.set(null);
    this.dateFrom.set(undefined);
    this.dateTo.set(undefined);

    this.productAutocomplete()?.reset();
    this.supplierAutocomplete()?.reset();
    this.movementTypeSelect()?.reset();
    this.quantityTypeSelect()?.reset();

    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  toggleDateFilters(): void {
    this.showDateFilters.update((value) => !value);
  }

  onDateFromChange(date: Date): void {
    this.dateFrom.set(date);
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  onDateToChange(date: Date): void {
    this.dateTo.set(date);
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  onProductSelect(productId: number | null): void {
    this.selectedProductId.set(productId);
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  onSupplierSelect(supplierId: number | null): void {
    this.selectedSupplierId.set(supplierId);
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  onMovementTypeChange(movementType: MovementType | null): void {
    this.selectedMovementType.set(movementType);
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  onQuantityTypeChange(quantityType: QuantityType | null): void {
    this.selectedQuantityType.set(quantityType);
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  onSort(field: StockMovementSortField): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('ASC');
    }
    this.isLoading.set(true);
    this.loadMovements();
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
      this.loadMovements();
    } else {
      this.goToPage(0);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  getMovementTypeBadgeVariant(
    type: MovementType
  ): 'default' | 'destructive' | 'outline' | 'secondary' {
    switch (type) {
      case MovementType.STOCK_IN:
        return 'default';
      case MovementType.STOCK_OUT:
        return 'destructive';
      case MovementType.INITIAL:
        return 'secondary';
      case MovementType.ADJUSTMENT:
        return 'outline';
      default:
        return 'secondary';
    }
  }

  getMovementTypeLabel(type: MovementType): string {
    switch (type) {
      case MovementType.STOCK_IN:
        return 'Entrada';
      case MovementType.STOCK_OUT:
        return 'Salida';
      case MovementType.INITIAL:
        return 'Inicial';
      case MovementType.ADJUSTMENT:
        return 'Ajuste';
      default:
        return type;
    }
  }

  getQuantityClass(quantity: number): string {
    return quantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
  }

  formatQuantity(quantity: number): string {
    return quantity > 0 ? `+${ quantity }` : `${ quantity }`;
  }

  onViewDetail(movement: StockMovementResponse): void {
    this.router.navigate(['/dashboard/inventory-movements', movement.movementId]).then(r => !r && undefined);
  }
}
