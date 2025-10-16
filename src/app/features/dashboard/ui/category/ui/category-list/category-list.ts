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
import { CategoryResponse } from '@features/dashboard/data/models/category-response.interface';
import { SearchCategoriesParams } from '@features/dashboard/data/models/search-categories-params.interface';
import { CategoryService } from '@features/dashboard/data/services/category/category.service';
import { CategorySortField } from '@features/dashboard/data/types/category-sort-field.type';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendar,
  lucideCheck,
  lucideChevronLeft,
  lucideChevronRight,
  lucideChevronsLeft,
  lucideChevronsRight,
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideSlidersHorizontal,
  lucideTrash2,
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
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { toast } from 'ngx-sonner';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-category-list',
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
    ...HlmSwitchImports,
    ...HlmPaginationImports,
    ...HlmIconImports,
    ...HlmInputImports,
    HlmLabel,
    NgIcon,
    HlmSpinner,
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
      lucideCheck,
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
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList implements OnInit, OnDestroy {
  constructor() {
    registerLocaleData(localeEs, 'es-PE');
  }

  private readonly categoryService = inject(CategoryService);
  private readonly paginationHelper = inject(PaginationHelperService);
  private readonly dateFormatter = inject(DateFormatterService);
  private readonly searchListHelper = inject(SearchListHelperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;

  readonly Math = Math;

  readonly categories = signal<CategoryResponse[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isRefreshing = signal<boolean>(false);

  readonly categoryToToggle = signal<CategoryResponse | null>(null);
  readonly isTogglingCategory = signal<boolean>(false);
  readonly categoryIdBeingToggled = signal<number | null>(null);
  readonly toggleAction = signal<'activate' | 'deactivate' | 'delete' | null>(null);

  readonly categoryToDelete = signal<CategoryResponse | null>(null);
  readonly isDeletingCategory = signal<boolean>(false);

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
  readonly sortField = signal<CategorySortField>('name');
  readonly sortDirection = signal<SortDirection>('ASC');

  readonly showFilters = signal<boolean>(false);
  readonly showDateFilters = signal<boolean>(false);
  readonly activeFilter = signal<ActiveFilterType>('all');

  readonly createdAfter = signal<Date | undefined>(undefined);
  readonly createdBefore = signal<Date | undefined>(undefined);
  readonly updatedAfter = signal<Date | undefined>(undefined);
  readonly updatedBefore = signal<Date | undefined>(undefined);

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
        this.loadCategories();
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
  }

  loadCategories(): void {
    const params: SearchCategoriesParams = {
      page: this.currentPage(),
      size: this.pageSize(),
      sortBy: this.sortField(),
      sortDirection: this.sortDirection(),
    };

    if (this.searchName()) {
      params.name = this.searchName();
    }

    this.searchListHelper.applyActiveFilter(params, this.activeFilter);

    const dateParams = this.dateFormatter.formatDateRangeParams({
      createdAfter: this.createdAfter(),
      createdBefore: this.createdBefore(),
      updatedAfter: this.updatedAfter(),
      updatedBefore: this.updatedBefore(),
    });

    Object.assign(params, dateParams);

    this.categoryService.searchCategories(params).subscribe({
      next: (response) => {
        this.searchListHelper.handlePaginatedResponse(response.data, this.categories, {
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
          'Error al cargar categorías',
          'No se pudieron cargar las categorías de productos'
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
    this.loadCategories();
  }

  onClearFilters(): void {
    this.searchInputValue.set('');
    this.searchName.set('');
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

  onSort(field: CategorySortField): void {
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

  private reloadFromPageZero(): void {
    if (this.currentPage() === 0) {
      this.loadCategories();
    } else {
      this.goToPage(0);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.isLoading.set(true);

    this.reloadFromPageZero();
  }

  onActivateAttempt(category: CategoryResponse): void {
    if (!category.isActive) {
      this.categoryToToggle.set(category);
      this.toggleAction.set('activate');
      this.categoryIdBeingToggled.set(category.categoryId);
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onDeactivateAttempt(category: CategoryResponse): void {
    if (category.isActive) {
      this.categoryToToggle.set(category);
      this.toggleAction.set('deactivate');
      this.categoryIdBeingToggled.set(category.categoryId);
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onCancelToggle(): void {
    this.categoryToToggle.set(null);
    this.toggleAction.set(null);
    this.categoryIdBeingToggled.set(null);
  }

  onConfirmToggle(closeDialog: () => void): void {
    const category = this.categoryToToggle();
    const action = this.toggleAction();

    if (!category || !action) {
      return;
    }

    if (action === 'delete') {
      this.isDeletingCategory.set(true);

      this.categoryService.deleteCategory(category.categoryId).subscribe({
        next: (response) => {
          this.categories.update((categories) =>
            categories.filter((c) => c.categoryId !== category.categoryId)
          );

          toast.success('Categoría eliminada', {
            description: response.message,
          });

          this.isDeletingCategory.set(false);
          this.categoryToDelete.set(null);
          this.toggleAction.set(null);
          closeDialog();
        },
        error: (error: ApiErrorResponse) => {
          this.isDeletingCategory.set(false);
          this.categoryToDelete.set(null);
          this.toggleAction.set(null);
          closeDialog();

          toast.error('Error al eliminar categoría', {
            description: error.message,
          });
        },
      });

      return;
    }

    this.isTogglingCategory.set(true);

    const serviceCall =
      action === 'activate'
        ? this.categoryService.activateCategory(category.categoryId)
        : this.categoryService.deactivateCategory(category.categoryId);

    const newState = action === 'activate';
    const successMessage = action === 'activate' ? 'Categoría activada' : 'Categoría desactivada';
    const errorMessage =
      action === 'activate' ? 'Error al activar categoría' : 'Error al desactivar categoría';

    serviceCall.subscribe({
      next: (response) => {
        this.categories.update((categories) =>
          categories.map((c) =>
            c.categoryId === category.categoryId ? { ...c, isActive: newState } : c
          )
        );

        toast.success(successMessage, {
          description: response.message,
        });

        this.isTogglingCategory.set(false);
        this.categoryToToggle.set(null);
        this.toggleAction.set(null);
        this.categoryIdBeingToggled.set(null);
        closeDialog();
      },
      error: (error: ApiErrorResponse) => {
        this.isTogglingCategory.set(false);
        this.categoryToToggle.set(null);
        this.toggleAction.set(null);
        this.categoryIdBeingToggled.set(null);
        closeDialog();

        toast.error(errorMessage, {
          description: error.message,
        });
      },
    });
  }

  onDeleteAttempt(category: CategoryResponse): void {
    if (!category.isActive) {
      this.categoryToDelete.set(category);
      this.categoryToToggle.set(category);
      this.toggleAction.set('delete');
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }
}
