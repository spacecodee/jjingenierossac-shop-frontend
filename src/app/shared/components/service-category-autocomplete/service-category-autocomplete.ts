import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceCategoryOption } from '@features/dashboard/data/models/service-category-option.interface';
import { ServiceCategoryService } from '@features/dashboard/data/services/service-category/service-category.service';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmAutocomplete } from '@spartan-ng/helm/autocomplete';
import { toast } from 'ngx-sonner';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-service-category-autocomplete',
  imports: [HlmAutocomplete, FormsModule],
  templateUrl: './service-category-autocomplete.html',
  styleUrl: './service-category-autocomplete.css',
})
export class ServiceCategoryAutocomplete implements OnInit, OnDestroy {
  private readonly serviceCategoryService = inject(ServiceCategoryService);
  private readonly categorySearchSubject = new Subject<string>();
  private categorySearchSubscription?: Subscription;

  readonly placeholder = input<string>('Busca una categoría...');
  readonly initialCategoryId = input<number | null>(null);
  readonly disabled = input<boolean>(false);

  readonly categorySelected = output<number | null>();

  readonly serviceCategories = signal<ServiceCategoryOption[]>([]);
  readonly isLoadingCategories = signal<boolean>(false);
  readonly serviceCategorySearch = signal<string>('');
  readonly serviceCategoryNames = computed(() => this.serviceCategories().map((c) => c.name));

  ngOnInit(): void {
    this.loadServiceCategories();

    this.categorySearchSubscription = this.categorySearchSubject
      .pipe(debounceTime(500))
      .subscribe((searchTerm) => {
        if (searchTerm.length >= 3 || searchTerm.length === 0) {
          this.loadServiceCategories(searchTerm);
        }
      });

    const categoryId = this.initialCategoryId();
    if (categoryId !== null) {
      this.loadAndSelectInitialCategory(categoryId);
    }
  }

  ngOnDestroy(): void {
    this.categorySearchSubscription?.unsubscribe();
  }

  loadServiceCategories(name?: string): void {
    this.isLoadingCategories.set(true);
    this.serviceCategoryService.getServiceCategoriesForSelect(name).subscribe({
      next: (response) => {
        this.serviceCategories.set(response.data);
        this.isLoadingCategories.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoadingCategories.set(false);
        toast.error('Error al cargar categorías', {
          description: error.message || 'No se pudieron cargar las categorías de servicio',
        });
      },
    });
  }

  loadAndSelectInitialCategory(categoryId: number): void {
    const category = this.serviceCategories().find((c) => c.serviceCategoryId === categoryId);
    if (category) {
      this.serviceCategorySearch.set(category.name);
    } else {
      this.serviceCategoryService.getServiceCategoriesForSelect().subscribe({
        next: (response) => {
          const foundCategory = response.data.find((c) => c.serviceCategoryId === categoryId);
          if (foundCategory) {
            this.serviceCategories.set(response.data);
            this.serviceCategorySearch.set(foundCategory.name);
          }
        },
      });
    }
  }

  onServiceCategorySelect(categoryName: string | null): void {
    if (categoryName) {
      const category = this.serviceCategories().find((c) => c.name === categoryName);
      if (category) {
        this.categorySelected.emit(category.serviceCategoryId);
      }
    } else {
      this.categorySelected.emit(null);
    }
  }

  onServiceCategorySearchChange(searchTerm: string): void {
    this.serviceCategorySearch.set(searchTerm);

    const isExactMatch = this.serviceCategories().some((c) => c.name === searchTerm);
    if (!isExactMatch) {
      this.categorySearchSubject.next(searchTerm);
    }
  }

  reset(): void {
    this.serviceCategorySearch.set('');
    this.categorySelected.emit(null);
  }
}
