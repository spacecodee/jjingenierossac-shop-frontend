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
import { CategorySelectResponse } from '@features/dashboard/data/models/category-select-response.interface';
import { CategoryService } from '@features/dashboard/data/services/category/category.service';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmAutocomplete } from '@spartan-ng/helm/autocomplete';
import { toast } from 'ngx-sonner';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-product-category-autocomplete',
  imports: [HlmAutocomplete, FormsModule],
  templateUrl: './product-category-autocomplete.html',
  styleUrl: './product-category-autocomplete.css',
})
export class ProductCategoryAutocomplete implements OnInit, OnDestroy {
  private readonly categoryService = inject(CategoryService);
  private readonly categorySearchSubject = new Subject<string>();
  private categorySearchSubscription?: Subscription;

  readonly placeholder = input<string>('Busca una categoría...');
  readonly initialCategoryId = input<number | null>(null);
  readonly disabled = input<boolean>(false);

  readonly categorySelected = output<number | null>();

  readonly categories = signal<CategorySelectResponse[]>([]);
  readonly isLoadingCategories = signal<boolean>(false);
  readonly categorySearch = signal<string>('');
  readonly categoryNames = computed(() => this.categories().map((c) => c.name));

  ngOnInit(): void {
    this.loadCategories();

    this.categorySearchSubscription = this.categorySearchSubject
      .pipe(debounceTime(500))
      .subscribe((searchTerm) => {
        if (searchTerm.length >= 3 || searchTerm.length === 0) {
          this.loadCategories(searchTerm);
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

  loadCategories(name?: string): void {
    this.isLoadingCategories.set(true);
    this.categoryService.getCategoriesForSelect(name).subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.isLoadingCategories.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoadingCategories.set(false);
        toast.error('Error al cargar categorías', {
          description: error.message || 'No se pudieron cargar las categorías de producto',
        });
      },
    });
  }

  loadAndSelectInitialCategory(categoryId: number): void {
    const category = this.categories().find((c) => c.categoryId === categoryId);
    if (category) {
      this.categorySearch.set(category.name);
    } else {
      this.categoryService.getCategoriesForSelect().subscribe({
        next: (response) => {
          const foundCategory = response.data.find((c) => c.categoryId === categoryId);
          if (foundCategory) {
            this.categories.set(response.data);
            this.categorySearch.set(foundCategory.name);
          }
        },
      });
    }
  }

  onCategorySelect(categoryName: string | null): void {
    if (categoryName) {
      const category = this.categories().find((c) => c.name === categoryName);
      if (category) {
        this.categorySelected.emit(category.categoryId);
      }
    } else {
      this.categorySelected.emit(null);
    }
  }

  onCategorySearchChange(searchTerm: string): void {
    this.categorySearch.set(searchTerm);

    const isExactMatch = this.categories().some((c) => c.name === searchTerm);
    if (!isExactMatch) {
      this.categorySearchSubject.next(searchTerm);
    }
  }

  reset(): void {
    this.categorySearch.set('');
    this.categorySelected.emit(null);
  }
}
