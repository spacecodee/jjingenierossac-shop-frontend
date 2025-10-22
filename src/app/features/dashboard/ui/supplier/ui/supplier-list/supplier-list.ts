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
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SearchSuppliersParams } from '@features/dashboard/data/models/search-suppliers-params.interface';
import { SupplierResponse } from '@features/dashboard/data/models/supplier-response.interface';
import { Supplier } from '@features/dashboard/data/services/supplier/supplier';
import { SupplierSortField } from '@features/dashboard/data/types/supplier-sort-field.type';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideSlidersHorizontal,
  lucideX,
} from '@ng-icons/lucide';
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
import { HlmSwitch } from '@spartan-ng/helm/switch';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { toast } from 'ngx-sonner';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-supplier-list',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...BrnAlertDialogImports,
    ...HlmAlertDialogImports,
    ...BrnTooltipImports,
    ...HlmTooltipImports,
    ...BrnSelectImports,
    ...HlmSelectImports,
    ...HlmTableImports,
    ...HlmBadgeImports,
    ...HlmRadioGroupImports,
    ...HlmDatePickerImports,
    ...HlmPaginationImports,
    ...HlmIconImports,
    ...HlmInputImports,
    HlmLabel,
    NgIcon,
    HlmSpinner,
    HlmSwitch,
    HlmSeparator,
    HlmSkeleton,
    FormsModule,
    DatePipe,
    RouterLink,
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
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronsLeft,
      lucideChevronsRight,
      lucidePencil,
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
  templateUrl: './supplier-list.html',
  styleUrl: './supplier-list.css',
})
export class SupplierList implements OnInit, OnDestroy {
  constructor() {
    registerLocaleData(localeEs, 'es-PE');
  }

  private readonly supplierService = inject(Supplier);
  private readonly paginationHelper = inject(PaginationHelperService);
  private readonly dateFormatter = inject(DateFormatterService);
  private readonly searchListHelper = inject(SearchListHelperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();
  private readonly nameSearchSubject = new Subject<string>();
  private readonly taxIdSearchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private nameSearchSubscription?: Subscription;
  private taxIdSearchSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;

  readonly Math = Math;

  readonly suppliers = signal<SupplierResponse[]>([]);
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
  readonly pageSize = signal<number>(10);
  readonly totalPages = signal<number>(0);
  readonly totalElements = signal<number>(0);
  readonly isFirst = signal<boolean>(true);
  readonly isLast = signal<boolean>(true);

  readonly searchGeneral = signal<string>('');
  readonly searchGeneralInputValue = signal<string>('');
  readonly searchName = signal<string>('');
  readonly searchNameInputValue = signal<string>('');
  readonly searchTaxId = signal<string>('');
  readonly searchTaxIdInputValue = signal<string>('');
  readonly sortField = signal<SupplierSortField>('name');
  readonly sortDirection = signal<SortDirection>('ASC');

  readonly showFilters = signal<boolean>(false);
  readonly showDateFilters = signal<boolean>(false);
  readonly showAdvancedSearch = signal<boolean>(false);
  readonly activeFilter = signal<ActiveFilterType>('all');

  readonly createdAfter = signal<Date | undefined>(undefined);
  readonly createdBefore = signal<Date | undefined>(undefined);
  readonly updatedAfter = signal<Date | undefined>(undefined);
  readonly updatedBefore = signal<Date | undefined>(undefined);

  readonly supplierToToggle = signal<SupplierResponse | null>(null);
  readonly toggleAction = signal<'activate' | 'deactivate' | null>(null);
  readonly supplierIdBeingToggled = signal<number | null>(null);
  readonly isTogglingSupplier = signal<boolean>(false);

  get activeFilterValue(): ActiveFilterType {
    return this.activeFilter();
  }

  set activeFilterValue(value: ActiveFilterType) {
    this.activeFilter.set(value);
  }

  readonly hasFiltersApplied = computed(() => {
    return (
      this.searchGeneral() !== '' ||
      this.searchName() !== '' ||
      this.searchTaxId() !== '' ||
      this.activeFilter() !== 'all' ||
      this.createdAfter() !== undefined ||
      this.createdBefore() !== undefined ||
      this.updatedAfter() !== undefined ||
      this.updatedBefore() !== undefined
    );
  });

  readonly displayedSuppliers = computed(() => {
    if (this.isLoading()) {
      return [];
    }
    return this.suppliers();
  });

  readonly pageNumbers = computed(() => {
    return this.paginationHelper.generatePageNumbers(this.currentPage(), this.totalPages());
  });

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(debounceTime(500)).subscribe((searchTerm) => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        this.searchGeneral.set(searchTerm);
        this.reloadFromPageZero();
      }
    });

    this.nameSearchSubscription = this.nameSearchSubject
    .pipe(debounceTime(500))
    .subscribe((searchTerm) => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        this.searchName.set(searchTerm);
        this.reloadFromPageZero();
      }
    });

    this.taxIdSearchSubscription = this.taxIdSearchSubject
    .pipe(debounceTime(500))
    .subscribe((searchTerm) => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        this.searchTaxId.set(searchTerm);
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
      this.loadSuppliers();
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.nameSearchSubscription?.unsubscribe();
    this.taxIdSearchSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
  }

  loadSuppliers(): void {
    const params: SearchSuppliersParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy: this.sortField(),
      sortDirection: this.sortDirection(),
    };

    if (this.searchGeneral()) {
      params.search = this.searchGeneral();
    }

    if (this.searchName()) {
      params.name = this.searchName();
    }

    if (this.searchTaxId()) {
      params.taxId = this.searchTaxId();
    }

    this.searchListHelper.applyActiveFilter(params, this.activeFilter);

    const dateParams = this.dateFormatter.formatDateRangeParams({
      createdAfter: this.createdAfter(),
      createdBefore: this.createdBefore(),
      updatedAfter: this.updatedAfter(),
      updatedBefore: this.updatedBefore(),
    });

    Object.assign(params, dateParams);

    this.supplierService.searchSuppliers(params).subscribe({
      next: (response) => {
        this.searchListHelper.handlePaginatedResponse(response.data, this.suppliers, {
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
          'Error al cargar proveedores',
          'No se pudieron cargar los proveedores del sistema'
        );
      },
    });
  }

  onSearchGeneralInput(value: string): void {
    this.searchGeneralInputValue.set(value);
    this.searchSubject.next(value);
  }

  onSearchNameInput(value: string): void {
    this.searchNameInputValue.set(value);
    this.nameSearchSubject.next(value);
  }

  onSearchTaxIdInput(value: string): void {
    this.searchTaxIdInputValue.set(value);
    this.taxIdSearchSubject.next(value);
  }

  onClearSearchGeneral(): void {
    this.searchGeneralInputValue.set('');
    this.searchGeneral.set('');
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  onClearSearchName(): void {
    this.searchNameInputValue.set('');
    this.searchName.set('');
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  onClearSearchTaxId(): void {
    this.searchTaxIdInputValue.set('');
    this.searchTaxId.set('');
    this.isLoading.set(true);
    this.reloadFromPageZero();
  }

  onRefresh(): void {
    this.isRefreshing.set(true);
    this.loadSuppliers();
  }

  onClearFilters(): void {
    this.searchGeneralInputValue.set('');
    this.searchGeneral.set('');
    this.searchNameInputValue.set('');
    this.searchName.set('');
    this.searchTaxIdInputValue.set('');
    this.searchTaxId.set('');
    this.activeFilter.set('all');
    this.createdAfter.set(undefined);
    this.createdBefore.set(undefined);
    this.updatedAfter.set(undefined);
    this.updatedBefore.set(undefined);
    this.isLoading.set(true);

    this.reloadFromPageZero();
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  toggleDateFilters(): void {
    this.showDateFilters.update((value) => !value);
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch.update((value) => !value);
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

  onSort(field: SupplierSortField): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('ASC');
    }
    this.isLoading.set(true);
    this.loadSuppliers();
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
      this.loadSuppliers();
    } else {
      this.goToPage(0);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.isLoading.set(true);

    this.reloadFromPageZero();
  }

  onActivateAttempt(supplier: SupplierResponse): void {
    if (!supplier.isActive) {
      this.supplierToToggle.set(supplier);
      this.toggleAction.set('activate');
      this.supplierIdBeingToggled.set(supplier.supplierId);
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onDeactivateAttempt(supplier: SupplierResponse): void {
    if (supplier.isActive) {
      this.supplierToToggle.set(supplier);
      this.toggleAction.set('deactivate');
      this.supplierIdBeingToggled.set(supplier.supplierId);
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onCancelToggle(): void {
    this.supplierToToggle.set(null);
    this.toggleAction.set(null);
    this.supplierIdBeingToggled.set(null);
  }

  onConfirmToggle(closeDialog: () => void): void {
    const supplier = this.supplierToToggle();
    const action = this.toggleAction();

    if (!supplier || !action) {
      return;
    }

    this.isTogglingSupplier.set(true);

    const toggleObservable =
      action === 'activate'
        ? this.supplierService.activateSupplier(supplier.supplierId)
        : this.supplierService.deactivateSupplier(supplier.supplierId);

    toggleObservable.subscribe({
      next: (response) => {
        const newState = action === 'activate';
        this.suppliers.update((suppliers) =>
          suppliers.map((s) =>
            s.supplierId === supplier.supplierId ? { ...s, isActive: newState } : s
          )
        );

        toast.success(action === 'activate' ? 'Proveedor activado' : 'Proveedor desactivado', {
          description: response.message,
        });

        this.isTogglingSupplier.set(false);
        this.supplierToToggle.set(null);
        this.toggleAction.set(null);
        this.supplierIdBeingToggled.set(null);
        closeDialog();
      },
      error: (error: ApiErrorResponse) => {
        this.isTogglingSupplier.set(false);
        this.supplierToToggle.set(null);
        this.toggleAction.set(null);
        this.supplierIdBeingToggled.set(null);
        closeDialog();

        if (error.status === 404) {
          toast.error('Proveedor no encontrado', {
            description: `El proveedor que intenta ${
              action === 'activate' ? 'activar' : 'desactivar'
            } no existe`,
          });
          this.loadSuppliers();
          return;
        }

        toast.error(
          action === 'activate' ? 'Error al activar proveedor' : 'Error al desactivar proveedor',
          {
            description:
              error.message ||
              `No se pudo ${ action === 'activate' ? 'activar' : 'desactivar' } el proveedor`,
          }
        );
      },
    });
  }
}
