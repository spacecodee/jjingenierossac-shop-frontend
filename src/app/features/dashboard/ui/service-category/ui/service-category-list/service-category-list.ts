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
import {
  SearchServiceCategoriesParams
} from '@features/dashboard/data/models/search-service-categories-params.interface';
import { ServiceCategoryResponse } from '@features/dashboard/data/models/service-category-response.interface';
import { ServiceCategoryService } from '@features/dashboard/data/services/service-category/service-category.service';
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
import { SortDirection } from '@shared/data/types/sort-direction.type';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmDatePickerImports, provideHlmDatePickerConfig } from '@spartan-ng/helm/date-picker';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { toast } from 'ngx-sonner';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

type SortField = 'name' | 'createdAt' | 'updatedAt' | 'isActive';
type ActiveFilterType = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-service-category-list',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...BrnSelectImports,
    ...HlmSelectImports,
    ...HlmTableImports,
    ...HlmBadgeImports,
    ...HlmRadioGroupImports,
    ...HlmDatePickerImports,
    HlmInput,
    HlmLabel,
    NgIcon,
    HlmSpinner,
    HlmSeparator,
    HlmSkeleton,
    ...HlmPaginationImports,
    FormsModule,
    DatePipe,
    HlmIconImports,
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
  templateUrl: './service-category-list.html',
  styleUrl: './service-category-list.css',
})
export class ServiceCategoryList implements OnInit, OnDestroy {
  constructor() {
    registerLocaleData(localeEs, 'es-PE');
  }

  private readonly serviceCategoryService = inject(ServiceCategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;

  readonly Math = Math;

  readonly categories = signal<ServiceCategoryResponse[]>([]);
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

  readonly searchName = signal<string>('');
  readonly searchInputValue = signal<string>('');
  readonly sortField = signal<SortField>('name');
  readonly sortDirection = signal<SortDirection>('ASC');

  readonly showFilters = signal<boolean>(false);
  readonly showDateFilters = signal<boolean>(false);
  private readonly _activeFilter = signal<ActiveFilterType>('all');

  readonly createdAfter = signal<Date | undefined>(undefined);
  readonly createdBefore = signal<Date | undefined>(undefined);
  readonly updatedAfter = signal<Date | undefined>(undefined);
  readonly updatedBefore = signal<Date | undefined>(undefined);

  get activeFilter(): ActiveFilterType {
    return this._activeFilter();
  }

  set activeFilter(value: ActiveFilterType) {
    this._activeFilter.set(value);
  }

  readonly hasFiltersApplied = computed(() => {
    return (
      this.searchName() !== '' ||
      this._activeFilter() !== 'all' ||
      this.createdAfter() !== undefined ||
      this.createdBefore() !== undefined ||
      this.updatedAfter() !== undefined ||
      this.updatedBefore() !== undefined
    );
  });

  readonly displayedCategories = computed(() => {
    if (this.isLoading()) {
      return [];
    }
    return this.categories();
  });

  readonly pageNumbers = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }

    if (current <= 3) {
      return [...Array.from({ length: 5 }, (_, i) => i), 'ellipsis', total - 1];
    }

    if (current >= total - 4) {
      return [0, 'ellipsis', ...Array.from({ length: 5 }, (_, i) => total - 5 + i)];
    }

    return [
      0,
      'ellipsis',
      ...Array.from({ length: 3 }, (_, i) => current - 1 + i),
      'ellipsis',
      total - 1,
    ];
  });

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(debounceTime(500)).subscribe((searchTerm) => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        this.searchName.set(searchTerm);
        this.goToPage(0);
      }
    });

    this.queryParamsSubscription = this.route.queryParamMap
      .pipe(
        map((params) => params.get('page')),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.isLoading.set(true);
        this.loadCategories();
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
  }

  loadCategories(): void {
    const params: SearchServiceCategoriesParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy: this.sortField(),
      sortDirection: this.sortDirection(),
    };

    if (this.searchName()) {
      params.name = this.searchName();
    }

    if (this._activeFilter() === 'active') {
      params.isActive = true;
    } else if (this._activeFilter() === 'inactive') {
      params.isActive = false;
    }

    if (this.createdAfter()) {
      const date = this.createdAfter()!;
      params.createdAtAfter = `${ date.getFullYear() }-${ String(date.getMonth() + 1).padStart(
        2,
        '0'
      ) }-${ String(date.getDate()).padStart(2, '0') }`;
    }

    if (this.createdBefore()) {
      const date = this.createdBefore()!;
      params.createdAtBefore = `${ date.getFullYear() }-${ String(date.getMonth() + 1).padStart(
        2,
        '0'
      ) }-${ String(date.getDate()).padStart(2, '0') }`;
    }

    if (this.updatedAfter()) {
      const date = this.updatedAfter()!;
      params.updatedAtAfter = `${ date.getFullYear() }-${ String(date.getMonth() + 1).padStart(
        2,
        '0'
      ) }-${ String(date.getDate()).padStart(2, '0') }`;
    }

    if (this.updatedBefore()) {
      const date = this.updatedBefore()!;
      params.updatedAtBefore = `${ date.getFullYear() }-${ String(date.getMonth() + 1).padStart(
        2,
        '0'
      ) }-${ String(date.getDate()).padStart(2, '0') }`;
    }

    this.serviceCategoryService.searchServiceCategories(params).subscribe({
      next: (response) => {
        this.categories.set(response.data.data);
        this.totalPages.set(response.data.pagination.totalPages);
        this.totalElements.set(response.data.pagination.totalElements);
        this.isFirst.set(response.data.pagination.first);
        this.isLast.set(response.data.pagination.last);
        this.isLoading.set(false);
        this.isRefreshing.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);
        this.isRefreshing.set(false);
        toast.error('Error al cargar categorías', {
          description: error.message || 'No se pudieron cargar las categorías de servicio',
        });
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
    this.goToPage(0);
  }

  onRefresh(): void {
    this.isRefreshing.set(true);
    this.loadCategories();
  }

  onClearFilters(): void {
    this.searchInputValue.set('');
    this.searchName.set('');
    this._activeFilter.set('all');
    this.createdAfter.set(undefined);
    this.createdBefore.set(undefined);
    this.updatedAfter.set(undefined);
    this.updatedBefore.set(undefined);
    this.goToPage(0);
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  toggleDateFilters(): void {
    this.showDateFilters.update((value) => !value);
  }

  onFilterActiveChange(filter: ActiveFilterType): void {
    this._activeFilter.set(filter);
    this.goToPage(0);
  }

  onCreatedAfterChange(date: Date): void {
    this.createdAfter.set(date);
    this.goToPage(0);
  }

  onCreatedBeforeChange(date: Date): void {
    this.createdBefore.set(date);
    this.goToPage(0);
  }

  onUpdatedAfterChange(date: Date): void {
    this.updatedAfter.set(date);
    this.goToPage(0);
  }

  onUpdatedBeforeChange(date: Date): void {
    this.updatedBefore.set(date);
    this.goToPage(0);
  }

  onSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('ASC');
    }
    this.isLoading.set(true);
    this.loadCategories();
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

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.isLoading.set(true);

    if (this.currentPage() === 0) {
      this.loadCategories();
    } else {
      this.goToPage(0);
    }
  }
}
