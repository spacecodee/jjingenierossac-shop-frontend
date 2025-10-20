import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SubcategorySelectResponse } from '@features/dashboard/data/models/subcategory-select-response.interface';
import { Subcategory } from '@features/dashboard/data/services/subcategory/subcategory';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmAutocomplete } from '@spartan-ng/helm/autocomplete';
import { toast } from 'ngx-sonner';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-subcategory-autocomplete',
  imports: [HlmAutocomplete, FormsModule],
  templateUrl: './subcategory-autocomplete.html',
  styleUrl: './subcategory-autocomplete.css',
})
export class SubcategoryAutocomplete implements OnInit, OnDestroy {
  private readonly subcategoryService = inject(Subcategory);
  private readonly subcategorySearchSubject = new Subject<string>();
  private subcategorySearchSubscription?: Subscription;

  readonly placeholder = input<string>('Busca una subcategoría...');
  readonly initialSubcategoryId = input<number | null>(null);
  readonly categoryId = input<number | null>(null);
  readonly disabled = input<boolean>(false);

  readonly subcategorySelected = output<number | null>();

  readonly subcategories = signal<SubcategorySelectResponse[]>([]);
  readonly isLoadingSubcategories = signal<boolean>(false);
  readonly subcategorySearch = signal<string>('');
  readonly subcategoryNames = computed(() => this.subcategories().map((s) => s.name));

  constructor() {
    effect(() => {
      const catId = this.categoryId();
      if (catId === null) {
        this.subcategories.set([]);
        this.subcategorySearch.set('');
      } else {
        this.loadSubcategories();
      }
    });
  }

  ngOnInit(): void {
    this.subcategorySearchSubscription = this.subcategorySearchSubject
    .pipe(debounceTime(500))
    .subscribe((searchTerm) => {
      if (searchTerm.length >= 3 || searchTerm.length === 0) {
        this.loadSubcategories(searchTerm);
      }
    });

    const subcategoryId = this.initialSubcategoryId();
    if (subcategoryId !== null && this.categoryId() !== null) {
      this.loadAndSelectInitialSubcategory(subcategoryId);
    }
  }

  ngOnDestroy(): void {
    this.subcategorySearchSubscription?.unsubscribe();
  }

  loadSubcategories(name?: string): void {
    const catId = this.categoryId();
    if (catId === null) {
      return;
    }

    this.isLoadingSubcategories.set(true);
    this.subcategoryService.getSubcategoriesForSelect(catId, name).subscribe({
      next: (response) => {
        this.subcategories.set(response.data);
        this.isLoadingSubcategories.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoadingSubcategories.set(false);
        toast.error('Error al cargar subcategorías', {
          description: error.message || 'No se pudieron cargar las subcategorías',
        });
      },
    });
  }

  loadAndSelectInitialSubcategory(subcategoryId: number): void {
    const subcategory = this.subcategories().find((s) => s.subcategoryId === subcategoryId);
    if (subcategory) {
      this.subcategorySearch.set(subcategory.name);
    } else {
      const catId = this.categoryId();
      if (catId !== null) {
        this.subcategoryService.getSubcategoriesForSelect(catId).subscribe({
          next: (response) => {
            const foundSubcategory = response.data.find((s) => s.subcategoryId === subcategoryId);
            if (foundSubcategory) {
              this.subcategories.set(response.data);
              this.subcategorySearch.set(foundSubcategory.name);
            }
          },
        });
      }
    }
  }

  onSubcategorySelect(subcategoryName: string | null): void {
    if (subcategoryName) {
      const subcategory = this.subcategories().find((s) => s.name === subcategoryName);
      if (subcategory) {
        this.subcategorySelected.emit(subcategory.subcategoryId);
      }
    } else {
      this.subcategorySelected.emit(null);
    }
  }

  onSubcategorySearchChange(searchTerm: string): void {
    this.subcategorySearch.set(searchTerm);

    const isExactMatch = this.subcategories().some((s) => s.name === searchTerm);
    if (!isExactMatch) {
      this.subcategorySearchSubject.next(searchTerm);
    }
  }

  reset(): void {
    this.subcategorySearch.set('');
    this.subcategorySelected.emit(null);
  }
}
