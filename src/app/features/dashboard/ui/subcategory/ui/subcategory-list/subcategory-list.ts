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
import { SearchSubcategoriesParams } from '@features/dashboard/data/models/search-subcategories-params.interface';
import { SubcategoryResponse } from '@features/dashboard/data/models/subcategory-response.interface';
import { Subcategory } from '@features/dashboard/data/services/subcategory/subcategory';
import { SubcategorySortField } from '@features/dashboard/data/types/subcategory-sort-field.type';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideSlidersHorizontal,
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
import { toast } from 'ngx-sonner';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-subcategory-list',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...BrnAlertDialogImports,
    ...HlmAlertDialogImports,
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
    HlmSeparator,
    HlmSkeleton,
    ...HlmSwitchImports,
    FormsModule,
    DatePipe,
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
  templateUrl: './subcategory-list.html',
  styleUrl: './subcategory-list.css',
})
export class SubcategoryList implements OnInit, OnDestroy {
  constructor() {
    registerLocaleData(localeEs, 'es-PE');
  }

  private readonly subcategoryService = inject(Subcategory);
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

  readonly subcategories = signal<SubcategoryResponse[]>([]);
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
  readonly sortField = signal<SubcategorySortField>('name');
  readonly sortDirection = signal<SortDirection>('ASC');

  readonly showFilters = signal<boolean>(false);
  readonly showDateFilters = signal<boolean>(false);
  readonly activeFilter = signal<ActiveFilterType>('all');
  readonly selectedCategoryId = signal<number | null>(null);

  readonly createdAfter = signal<Date | undefined>(undefined);
  readonly createdBefore = signal<Date | undefined>(undefined);
  readonly updatedAfter = signal<Date | undefined>(undefined);
  readonly updatedBefore = signal<Date | undefined>(undefined);

  readonly subcategoryToToggle = signal<SubcategoryResponse | null>(null);
  readonly toggleAction = signal<'activate' | 'deactivate' | null>(null);
  readonly subcategoryIdBeingToggled = signal<number | null>(null);
  readonly isTogglingSubcategory = signal<boolean>(false);

  get activeFilterValue(): ActiveFilterType {
    return this.activeFilter();
  }

  set activeFilterValue(value: ActiveFilterType) {
    this.activeFilter.set(value);
  }

  readonly hasFiltersApplied = computed(() => {
    return (
      this.searchName() !== '' ||
      this.activeFilter() !== 'all' ||
      this.selectedCategoryId() !== null ||
      this.createdAfter() !== undefined ||
      this.createdBefore() !== undefined ||
      this.updatedAfter() !== undefined ||
      this.updatedBefore() !== undefined
    );
  });

  readonly displayedSubcategories = computed(() => {
    if (this.isLoading()) {
      return [];
    }
    return this.subcategories();
  });

  readonly pageNumbers = computed(() => {
    return this.paginationHelper.generatePageNumbers(this.currentPage(), this.totalPages());
  });

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(debounceTime(500)).subscribe((searchTerm) => {
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
        this.loadSubcategories();
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
  }

  loadSubcategories(): void {
    const params: SearchSubcategoriesParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy: this.sortField(),
      sortDirection: this.sortDirection(),
    };

    if (this.searchName()) {
      params.name = this.searchName();
    }

    if (this.selectedCategoryId() !== null) {
      params.categoryId = this.selectedCategoryId()!;
    }

    this.searchListHelper.applyActiveFilter(params, this.activeFilter);

    const dateParams = this.dateFormatter.formatDateRangeParams({
      createdAfter: this.createdAfter(),
      createdBefore: this.createdBefore(),
      updatedAfter: this.updatedAfter(),
      updatedBefore: this.updatedBefore(),
    });

    Object.assign(params, dateParams);

    this.subcategoryService.searchSubcategories(params).subscribe({
      next: (response) => {
        this.searchListHelper.handlePaginatedResponse(response.data, this.subcategories, {
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
          'Error al cargar subcategorías',
          'No se pudieron cargar las subcategorías de productos'
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
    this.loadSubcategories();
  }

  onClearFilters(): void {
    this.searchInputValue.set('');
    this.searchName.set('');
    this.activeFilter.set('all');
    this.selectedCategoryId.set(null);
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
      this.isLoading.set(true);
      this.reloadFromPageZero();
    }
  }

  onSort(field: SubcategorySortField): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('ASC');
    }
    this.isLoading.set(true);
    this.loadSubcategories();
  }

  onActivateAttempt(subcategory: SubcategoryResponse): void {
    if (!subcategory.isActive) {
      this.subcategoryToToggle.set(subcategory);
      this.toggleAction.set('activate');
      this.subcategoryIdBeingToggled.set(subcategory.subcategoryId);
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onDeactivateAttempt(subcategory: SubcategoryResponse): void {
    if (subcategory.isActive) {
      this.subcategoryToToggle.set(subcategory);
      this.toggleAction.set('deactivate');
      this.subcategoryIdBeingToggled.set(subcategory.subcategoryId);
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onCancelToggle(): void {
    this.subcategoryToToggle.set(null);
    this.toggleAction.set(null);
    this.subcategoryIdBeingToggled.set(null);
  }

  onConfirmToggle(closeDialog: () => void): void {
    const subcategory = this.subcategoryToToggle();
    const action = this.toggleAction();

    if (!subcategory || !action) {
      return;
    }

    this.isTogglingSubcategory.set(true);

    const subcategoryCall =
      action === 'activate'
        ? this.subcategoryService.activateSubcategory(subcategory.subcategoryId)
        : this.subcategoryService.deactivateSubcategory(subcategory.subcategoryId);

    const newState = action === 'activate';
    const successMessage =
      action === 'activate' ? 'Subcategoría activada' : 'Subcategoría desactivada';
    const errorMessage =
      action === 'activate' ? 'Error al activar subcategoría' : 'Error al desactivar subcategoría';

    subcategoryCall.subscribe({
      next: (response) => {
        this.subcategories.update((subcategories) =>
          subcategories.map((s) =>
            s.subcategoryId === subcategory.subcategoryId ? { ...s, isActive: newState } : s
          )
        );

        toast.success(successMessage, {
          description: response.message,
        });

        this.isTogglingSubcategory.set(false);
        this.subcategoryToToggle.set(null);
        this.toggleAction.set(null);
        this.subcategoryIdBeingToggled.set(null);
        closeDialog();
      },
      error: (error: ApiErrorResponse) => {
        this.isTogglingSubcategory.set(false);
        this.subcategoryToToggle.set(null);
        this.toggleAction.set(null);
        this.subcategoryIdBeingToggled.set(null);
        closeDialog();

        toast.error(errorMessage, {
          description: error.message,
        });
      },
    });
  }

  private reloadFromPageZero(): void {
    if (this.currentPage() === 0) {
      this.loadSubcategories();
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
}
