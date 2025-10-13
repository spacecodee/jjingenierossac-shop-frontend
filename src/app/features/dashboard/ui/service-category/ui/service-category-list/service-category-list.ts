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
  BatchActivateServiceCategoriesRequest
} from '@features/dashboard/data/models/batch-activate-service-categories-request.interface';
import {
  BatchDeactivateServiceCategoriesRequest
} from '@features/dashboard/data/models/batch-deactivate-service-categories-request.interface';
import { BatchOperationItemResponse } from '@features/dashboard/data/models/batch-operation-item-response.interface';
import {
  SearchServiceCategoriesParams
} from '@features/dashboard/data/models/search-service-categories-params.interface';
import { ServiceCategoryResponse } from '@features/dashboard/data/models/service-category-response.interface';
import { ServiceCategoryService } from '@features/dashboard/data/services/service-category/service-category.service';
import { ServiceCategorySortField } from '@features/dashboard/data/types/service-category-sort-field.type';
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
import { BatchActionBar } from '@shared/components/batch-action-bar/batch-action-bar';
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
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
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
  selector: 'app-service-category-list',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...BrnAlertDialogImports,
    ...BrnSelectImports,
    ...BrnTooltipImports,
    ...HlmSelectImports,
    ...HlmTableImports,
    ...HlmBadgeImports,
    ...HlmRadioGroupImports,
    ...HlmDatePickerImports,
    ...HlmSwitchImports,
    ...HlmAlertDialogImports,
    ...HlmPaginationImports,
    ...HlmCheckboxImports,
    ...HlmTooltipImports,
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
    BatchActionBar,
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
  templateUrl: './service-category-list.html',
  styleUrl: './service-category-list.css',
})
export class ServiceCategoryList implements OnInit, OnDestroy {
  constructor() {
    registerLocaleData(localeEs, 'es-PE');
  }

  private readonly serviceCategoryService = inject(ServiceCategoryService);
  private readonly paginationHelper = inject(PaginationHelperService);
  private readonly dateFormatter = inject(DateFormatterService);
  private readonly searchListHelper = inject(SearchListHelperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private queryParamsSubscription?: Subscription;

  readonly Math = Math;

  readonly categories = signal<ServiceCategoryResponse[]>([]);
  readonly isLoading = signal<boolean>(true);
  readonly isRefreshing = signal<boolean>(false);

  readonly categoryToToggle = signal<ServiceCategoryResponse | null>(null);
  readonly isTogglingCategory = signal<boolean>(false);
  readonly categoryIdBeingToggled = signal<number | null>(null);
  readonly toggleAction = signal<'activate' | 'deactivate' | 'delete' | null>(null);

  readonly categoryToDelete = signal<ServiceCategoryResponse | null>(null);
  readonly isDeletingCategory = signal<boolean>(false);

  readonly selectedCategories = signal<Set<number>>(new Set());
  readonly isSelectAllChecked = signal<boolean>(false);
  readonly isBatchOperationInProgress = signal<boolean>(false);
  readonly batchToggleAction = signal<'activate' | 'deactivate' | null>(null);
  readonly batchOperationResults = signal<BatchOperationItemResponse[]>([]);
  readonly showBatchResultsDialog = signal<boolean>(false);

  readonly selectedCount = computed(() => this.selectedCategories().size);
  readonly hasSelectedCategories = computed(() => this.selectedCategories().size > 0);
  readonly maxBatchSize = 50;

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
  readonly sortField = signal<ServiceCategorySortField>('name');
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
    const params: SearchServiceCategoriesParams = {
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

    this.serviceCategoryService.searchServiceCategories(params).subscribe({
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
          'No se pudieron cargar las categorías de servicio'
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

  onSort(field: ServiceCategorySortField): void {
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

  onActivateAttempt(category: ServiceCategoryResponse): void {
    if (!category.isActive) {
      this.categoryToToggle.set(category);
      this.toggleAction.set('activate');
      this.categoryIdBeingToggled.set(category.serviceCategoryId);
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onDeactivateAttempt(category: ServiceCategoryResponse): void {
    if (category.isActive) {
      this.categoryToToggle.set(category);
      this.toggleAction.set('deactivate');
      this.categoryIdBeingToggled.set(category.serviceCategoryId);
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

      this.serviceCategoryService.deleteServiceCategory(category.serviceCategoryId).subscribe({
        next: (response) => {
          this.categories.update((categories) =>
            categories.filter((c) => c.serviceCategoryId !== category.serviceCategoryId)
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
        ? this.serviceCategoryService.activateServiceCategory(category.serviceCategoryId)
        : this.serviceCategoryService.deactivateServiceCategory(category.serviceCategoryId);

    const newState = action === 'activate';
    const successMessage = action === 'activate' ? 'Categoría activada' : 'Categoría desactivada';
    const errorMessage =
      action === 'activate' ? 'Error al activar categoría' : 'Error al desactivar categoría';

    serviceCall.subscribe({
      next: (response) => {
        this.categories.update((categories) =>
          categories.map((c) =>
            c.serviceCategoryId === category.serviceCategoryId ? { ...c, isActive: newState } : c
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

  onDeleteAttempt(category: ServiceCategoryResponse): void {
    if (!category.isActive) {
      this.categoryToDelete.set(category);
      this.categoryToToggle.set(category);
      this.toggleAction.set('delete');
      const trigger = document.getElementById('toggle-dialog-trigger') as HTMLButtonElement;
      trigger?.click();
    }
  }

  onCheckboxChange(categoryId: number, checked: boolean): void {
    const selected = new Set(this.selectedCategories());

    if (checked) {
      if (selected.size >= this.maxBatchSize) {
        toast.warning('Límite alcanzado', {
          description: `Máximo ${ this.maxBatchSize } categorías por operación`,
        });
        return;
      }
      selected.add(categoryId);
    } else {
      selected.delete(categoryId);
    }

    this.selectedCategories.set(selected);
    this.updateSelectAllState();
  }

  isSelected(categoryId: number): boolean {
    return this.selectedCategories().has(categoryId);
  }

  onSelectAllChange(checked: boolean): void {
    const selected = new Set<number>();

    if (checked) {
      const categoriesToSelect = this.displayedCategories().slice(0, this.maxBatchSize);
      for (const category of categoriesToSelect) {
        selected.add(category.serviceCategoryId);
      }

      if (this.displayedCategories().length > this.maxBatchSize) {
        toast.warning('Límite alcanzado', {
          description: `Solo se seleccionaron las primeras ${ this.maxBatchSize } categorías`,
        });
      }
    }

    this.selectedCategories.set(selected);
    this.updateSelectAllState();
  }

  private updateSelectAllState(): void {
    const displayedIds = this.displayedCategories().map((c) => c.serviceCategoryId);
    const selectedIds = this.selectedCategories();
    const allDisplayedSelected = displayedIds.every((id) => selectedIds.has(id));
    this.isSelectAllChecked.set(allDisplayedSelected && displayedIds.length > 0);
  }

  onBatchActivateAttempt(): void {
    if (this.selectedCategories().size === 0) {
      return;
    }

    this.batchToggleAction.set('activate');
    const trigger = document.getElementById('batch-dialog-trigger') as HTMLButtonElement;
    trigger?.click();
  }

  onBatchDeactivateAttempt(): void {
    if (this.selectedCategories().size === 0) {
      return;
    }

    this.batchToggleAction.set('deactivate');
    const trigger = document.getElementById('batch-dialog-trigger') as HTMLButtonElement;
    trigger?.click();
  }

  onCancelBatchSelection(): void {
    this.selectedCategories.set(new Set());
    this.isSelectAllChecked.set(false);
  }

  onCancelBatchToggle(): void {
    this.batchToggleAction.set(null);
  }

  onConfirmBatchToggle(closeDialog: () => void): void {
    const action = this.batchToggleAction();
    const selectedIds = this.selectedCategories();

    if (!action || selectedIds.size === 0) {
      return;
    }

    this.isBatchOperationInProgress.set(true);

    const request: BatchActivateServiceCategoriesRequest | BatchDeactivateServiceCategoriesRequest =
      { ids: Array.from(selectedIds) };

    const serviceCall =
      action === 'activate'
        ? this.serviceCategoryService.batchActivateServiceCategories(request)
        : this.serviceCategoryService.batchDeactivateServiceCategories(request);

    const newState = action === 'activate';

    serviceCall.subscribe({
      next: (response) => {
        const results = response.data.results;
        this.batchOperationResults.set(results);

        const successfulIds = new Set(
          results.filter((r) => r.status === 'success').map((r) => r.id)
        );

        this.categories.update((categories) =>
          categories.map((c) =>
            successfulIds.has(c.serviceCategoryId) ? { ...c, isActive: newState } : c
          )
        );

        this.isBatchOperationInProgress.set(false);
        this.batchToggleAction.set(null);
        closeDialog();

        if (response.data.successful > 0 && response.data.failed === 0) {
          toast.success('Operación completada', {
            description: response.message,
          });
          this.onCancelBatchSelection();
        } else {
          this.showBatchResultsDialog.set(true);
          const resultsTrigger = document.getElementById(
            'batch-results-dialog-trigger'
          ) as HTMLButtonElement;
          resultsTrigger?.click();
        }
      },
      error: (error: ApiErrorResponse) => {
        this.isBatchOperationInProgress.set(false);
        this.batchToggleAction.set(null);
        closeDialog();

        toast.error('Error en operación batch', {
          description: error.message,
        });
      },
    });
  }

  getSelectedCategories(): ServiceCategoryResponse[] {
    const selectedIds = this.selectedCategories();
    return this.categories().filter((c) => selectedIds.has(c.serviceCategoryId));
  }

  getSuccessfulResultsCount(): number {
    return this.batchOperationResults().filter((r) => r.status === 'success').length;
  }

  getFailedResultsCount(): number {
    return this.batchOperationResults().filter((r) => r.status === 'failed').length;
  }

  getFailedResults(): BatchOperationItemResponse[] {
    return this.batchOperationResults().filter((r) => r.status === 'failed');
  }

  onCloseBatchResultsDialog(): void {
    this.showBatchResultsDialog.set(false);
    this.batchOperationResults.set([]);
    this.onCancelBatchSelection();
  }
}
