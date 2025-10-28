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
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerResponse } from '@features/dashboard/data/models/customer-response.interface';
import { SearchCustomersParams } from '@features/dashboard/data/models/search-customers-params.interface';
import { Customer } from '@features/dashboard/data/services/customer/customer';
import { CustomerSortField } from '@features/dashboard/data/types/customer-sort-field.type';
import { CustomerStatusFilter } from '@features/dashboard/data/types/customer-status-filter.type';
import { LastLoginFilter } from '@features/dashboard/data/types/last-login-filter.type';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideCheck,
  lucideClock,
  lucideEye,
  lucideLock,
  lucideMail,
  lucideRefreshCw,
  lucideSearch,
  lucideShield,
  lucideSlidersHorizontal,
  lucideUser,
  lucideX,
} from '@ng-icons/lucide';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { SortDirection } from '@shared/data/types/sort-direction.type';
import { DateFormatterService } from '@shared/services/date-formatter.service';
import { PaginationHelperService } from '@shared/services/pagination-helper.service';
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
  selector: 'app-customer-list',
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
    ...BrnTooltipImports,
    ...HlmTooltipImports,
    ...BrnAlertDialogImports,
    ...HlmAlertDialogImports,
    ...HlmSwitchImports,
    HlmLabel,
    NgIcon,
    HlmSpinner,
    HlmSeparator,
    HlmSkeleton,
    FormsModule,
    DatePipe,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-PE' },
    provideIcons({
      lucideSearch,
      lucideX,
      lucideSlidersHorizontal,
      lucideCalendar,
      lucideRefreshCw,
      lucideEye,
      lucideUser,
      lucideMail,
      lucideCheck,
      lucideLock,
      lucideShield,
      lucideClock,
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
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.css',
})
export class CustomerList implements OnInit, OnDestroy {
  constructor() {
    registerLocaleData(localeEs, 'es-PE');
  }

  private readonly customerService = inject(Customer);
  private readonly paginationHelper = inject(PaginationHelperService);
  private readonly dateFormatter = inject(DateFormatterService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;

  readonly Math = Math;

  readonly customers = signal<CustomerResponse[]>([]);
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
  readonly sortField = signal<CustomerSortField>('createdAt');
  readonly sortDirection = signal<SortDirection>('DESC');

  readonly showFilters = signal<boolean>(false);
  readonly showDateFilters = signal<boolean>(false);
  readonly statusFilter = signal<CustomerStatusFilter>('ALL');
  readonly emailVerifiedFilter = signal<boolean | null>(null);
  readonly lastLoginFilter = signal<LastLoginFilter | null>(null);
  readonly isLockedFilter = signal<boolean | null>(null);

  readonly dateFrom = signal<Date | undefined>(undefined);
  readonly dateTo = signal<Date | undefined>(undefined);

  get statusFilterValue(): CustomerStatusFilter {
    return this.statusFilter();
  }

  set statusFilterValue(value: CustomerStatusFilter) {
    this.statusFilter.set(value);
  }

  readonly hasFiltersApplied = computed(() => {
    return (
      this.searchTerm() !== '' ||
      this.statusFilter() !== 'ALL' ||
      this.emailVerifiedFilter() !== null ||
      this.lastLoginFilter() !== null ||
      this.isLockedFilter() !== null ||
      this.dateFrom() !== undefined ||
      this.dateTo() !== undefined
    );
  });

  readonly displayedCustomers = computed(() => {
    if (this.isLoading()) {
      return [];
    }
    return this.customers();
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
      this.loadCustomers();
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
  }

  loadCustomers(): void {
    const params: SearchCustomersParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy: this.sortField(),
      sortDirection: this.sortDirection(),
    };

    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }

    if (this.statusFilter() !== 'ALL') {
      params.status = this.statusFilter();
    }

    if (this.emailVerifiedFilter() !== null) {
      params.emailVerified = this.emailVerifiedFilter()!;
    }

    if (this.lastLoginFilter() !== null) {
      params.lastLoginFilter = this.lastLoginFilter()!;
    }

    if (this.isLockedFilter() !== null) {
      params.isLocked = this.isLockedFilter()!;
    }

    if (this.dateFrom()) {
      params.dateFrom = this.dateFormatter.formatToApiDate(this.dateFrom()!);
    }

    if (this.dateTo()) {
      params.dateTo = this.dateFormatter.formatToApiDate(this.dateTo()!);
    }

    this.customerService.searchCustomers(params).subscribe({
      next: (response) => {
        this.customers.set(response.data.pageData);
        this.totalPages.set(response.data.pagination.totalPages);
        this.totalElements.set(response.data.pagination.totalElements);
        this.isFirst.set(response.data.pagination.first);
        this.isLast.set(response.data.pagination.last);
        this.isLoading.set(false);
        this.isRefreshing.set(false);
      },
      error: (error: ApiErrorResponse) => {
        toast.error('Error al cargar clientes', {
          description: error.message || 'No se pudieron cargar los clientes',
        });
        this.isLoading.set(false);
        this.isRefreshing.set(false);
      },
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchInputValue.set(value);
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchInputValue.set('');
    this.searchTerm.set('');
    this.reloadFromPageZero();
  }

  onSortChange(field: CustomerSortField): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('DESC');
    }
    this.reloadFromPageZero();
  }

  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  toggleDateFilters(): void {
    this.showDateFilters.set(!this.showDateFilters());
  }

  applyFilters(): void {
    this.reloadFromPageZero();
  }

  clearFilters(): void {
    this.statusFilter.set('ALL');
    this.emailVerifiedFilter.set(null);
    this.lastLoginFilter.set(null);
    this.isLockedFilter.set(null);
    this.dateFrom.set(undefined);
    this.dateTo.set(undefined);
    this.reloadFromPageZero();
  }

  private reloadFromPageZero(): void {
    if (this.currentPage() === 0) {
      this.loadCustomers();
    } else {
      this.goToPage(0);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.isLoading.set(true);

    this.reloadFromPageZero();
  }

  refreshList(): void {
    this.isRefreshing.set(true);
    this.loadCustomers();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;

    this.router
    .navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    })
    .then(() => undefined);
  }

  viewCustomerDetail(customer: CustomerResponse): void {
    this.router.navigate(['/dashboard/customers', customer.userId]).then(() => undefined);
  }

  getActiveStatusBadge(): 'default' | 'secondary' | 'destructive' | 'outline' {
    return 'default';
  }

  getInactiveStatusBadge(): 'default' | 'secondary' | 'destructive' | 'outline' {
    return 'destructive';
  }

  getActiveStatusLabel(): string {
    return 'Activa';
  }

  getInactiveStatusLabel(): string {
    return 'Inactiva';
  }

  formatDaysSinceLastLogin(lastLoginAt: string | null): string {
    if (!lastLoginAt) {
      return 'Nunca';
    }
    const date = new Date(lastLoginAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${ diffDays } días`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? 'Hace 1 semana' : `Hace ${ weeks } semanas`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? 'Hace 1 mes' : `Hace ${ months } meses`;
    }
    const years = Math.floor(diffDays / 365);
    return years === 1 ? 'Hace 1 año' : `Hace ${ years } años`;
  }

  readonly customerToToggle = signal<CustomerResponse | null>(null);
  readonly toggleAction = signal<'activate' | 'deactivate' | null>(null);
  readonly customerIdBeingToggled = signal<number | null>(null);
  readonly isTogglingCustomer = signal<boolean>(false);

  onActivateAttempt(customer: CustomerResponse): void {
    if (!customer.isActive) {
      this.customerToToggle.set(customer);
      this.toggleAction.set('activate');
      this.customerIdBeingToggled.set(customer.userId);
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onDeactivateAttempt(customer: CustomerResponse): void {
    if (customer.isActive) {
      this.customerToToggle.set(customer);
      this.toggleAction.set('deactivate');
      this.customerIdBeingToggled.set(customer.userId);
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onCancelToggle(): void {
    this.customerToToggle.set(null);
    this.toggleAction.set(null);
    this.customerIdBeingToggled.set(null);
  }

  onConfirmToggle(closeDialog: () => void): void {
    const customer = this.customerToToggle();
    const action = this.toggleAction();

    if (!customer || !action) {
      return;
    }

    this.isTogglingCustomer.set(true);

    const serviceCall =
      action === 'activate'
        ? this.customerService.activateCustomer(customer.userId)
        : this.customerService.deactivateCustomer(customer.userId);

    const newState = action === 'activate';
    const successMessage = action === 'activate' ? 'Cliente activado' : 'Cliente desactivado';
    const errorMessage =
      action === 'activate' ? 'Error al activar cliente' : 'Error al desactivar cliente';

    serviceCall.subscribe({
      next: (response) => {
        this.customers.update((customers) =>
          customers.map((c) => (c.userId === customer.userId ? { ...c, isActive: newState } : c))
        );

        toast.success(successMessage, {
          description: response.message,
        });

        this.isTogglingCustomer.set(false);
        this.customerToToggle.set(null);
        this.toggleAction.set(null);
        this.customerIdBeingToggled.set(null);
        closeDialog();
      },
      error: (error: ApiErrorResponse) => {
        this.isTogglingCustomer.set(false);
        this.customerToToggle.set(null);
        this.toggleAction.set(null);
        this.customerIdBeingToggled.set(null);
        closeDialog();

        toast.error(errorMessage, {
          description: error.message,
        });
      },
    });
  }
}
