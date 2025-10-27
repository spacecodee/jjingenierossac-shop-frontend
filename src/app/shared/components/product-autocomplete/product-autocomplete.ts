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
import { ProductSelectResponse } from '@features/dashboard/data/models/product-select-response.interface';
import { Product } from '@features/dashboard/data/services/product/product';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmAutocomplete } from '@spartan-ng/helm/autocomplete';
import { toast } from 'ngx-sonner';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-product-autocomplete',
  imports: [HlmAutocomplete, FormsModule],
  templateUrl: './product-autocomplete.html',
  styleUrl: './product-autocomplete.css',
})
export class ProductAutocomplete implements OnInit, OnDestroy {
  private readonly productService = inject(Product);
  private readonly productSearchSubject = new Subject<string>();
  private productSearchSubscription?: Subscription;

  readonly placeholder = input<string>('Busca un producto...');
  readonly initialProductId = input<number | null>(null);
  readonly disabled = input<boolean>(false);

  readonly productSelected = output<number | null>();

  readonly products = signal<ProductSelectResponse[]>([]);
  readonly isLoadingProducts = signal<boolean>(false);
  readonly productSearch = signal<string>('');
  readonly productNames = computed(() => this.products().map((p) => p.name));

  ngOnInit(): void {
    this.loadProducts();

    this.productSearchSubscription = this.productSearchSubject
    .pipe(debounceTime(500))
    .subscribe((searchTerm) => {
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        this.loadProducts(searchTerm);
      }
    });

    const productId = this.initialProductId();
    if (productId !== null) {
      this.loadAndSelectInitialProduct(productId);
    }
  }

  ngOnDestroy(): void {
    this.productSearchSubscription?.unsubscribe();
  }

  loadProducts(search?: string): void {
    this.isLoadingProducts.set(true);
    this.productService.getProductsForSelect(search).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.isLoadingProducts.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoadingProducts.set(false);
        toast.error('Error al cargar productos', {
          description: error.message || 'No se pudieron cargar los productos',
        });
      },
    });
  }

  loadAndSelectInitialProduct(productId: number): void {
    const product = this.products().find((p) => p.productId === productId);
    if (product) {
      this.productSearch.set(product.name);
    } else {
      this.productService.getProductsForSelect().subscribe({
        next: (response) => {
          const foundProduct = response.data.find((p) => p.productId === productId);
          if (foundProduct) {
            this.products.set(response.data);
            this.productSearch.set(foundProduct.name);
          }
        },
      });
    }
  }

  onProductSelect(productName: string | null): void {
    if (productName) {
      const product = this.products().find((p) => p.name === productName);
      if (product) {
        this.productSelected.emit(product.productId);
      }
    } else {
      this.productSelected.emit(null);
    }
  }

  onProductSearchChange(searchTerm: string): void {
    this.productSearch.set(searchTerm);

    const isExactMatch = this.products().some((p) => p.name === searchTerm);
    if (!isExactMatch) {
      this.productSearchSubject.next(searchTerm);
    }
  }

  reset(): void {
    this.productSearch.set('');
    this.productSelected.emit(null);
  }
}
