import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicProductResponse } from '@features/public/data/models/public-product-response.interface';
import { PublicProductApi } from '@features/public/data/services/public-product/public-product-api';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideBarcode,
  lucideBox,
  lucideLayers,
  lucidePackage,
  lucideRefreshCw,
  lucideShoppingCart,
  lucideTag,
} from '@ng-icons/lucide';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmBreadCrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-public-product-detail',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmBadgeImports,
    ...HlmBreadCrumbImports,
    ...HlmIconImports,
    HlmSeparator,
    HlmSkeleton,
    NgIcon,
    CurrencyPipe,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideTag,
      lucideBox,
      lucidePackage,
      lucideRefreshCw,
      lucideShoppingCart,
      lucideLayers,
      lucideBarcode,
    }),
  ],
  templateUrl: './public-product-detail.html',
})
export class PublicProductDetail implements OnInit {
  private readonly publicProductApi = inject(PublicProductApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly product = signal<PublicProductResponse | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly productId = signal<number | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id && !Number.isNaN(+id) && +id > 0) {
        this.productId.set(+id);
        this.loadProductDetail(+id);
      } else {
        this.handleInvalidId();
      }
    });
  }

  loadProductDetail(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.publicProductApi.getPublicProductById(id).subscribe({
      next: (response) => {
        this.product.set(response.data);
        this.isLoading.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);
        this.error.set(error.message || 'No se pudo cargar el producto');
        toast.error('Error al cargar el producto', {
          description: error.message || 'No se pudo cargar la información del producto',
        });
      },
    });
  }

  handleInvalidId(): void {
    this.isLoading.set(false);
    this.error.set('El identificador del producto no es válido');
    toast.error('Error', {
      description: 'El identificador del producto debe ser un número válido',
    });
  }

  onRetry(): void {
    const id = this.productId();
    if (id) {
      this.loadProductDetail(id);
    }
  }

  onBackToCatalog(): void {
    this.router.navigate(['/public/products']).then((r) => !r && undefined);
  }

  onAddToCart(): void {
    toast.info('Funcionalidad próximamente', {
      description: 'El carrito de compras estará disponible pronto',
    });
  }

  onReserveProduct(): void {
    toast.info('Funcionalidad próximamente', {
      description: 'El sistema de reservas estará disponible pronto',
    });
  }

  onViewCategory(): void {
    const categoryId = this.product()?.category.categoryId;
    if (categoryId) {
      this.router
      .navigate(['/public/products'], {
        queryParams: { categoryId },
      })
      .then((r) => !r && undefined);
    }
  }

  onViewSubcategory(): void {
    const subcategoryId = this.product()?.subcategory.subcategoryId;
    const categoryId = this.product()?.category.categoryId;
    if (subcategoryId && categoryId) {
      this.router
      .navigate(['/public/products'], {
        queryParams: { categoryId, subcategoryId },
      })
      .then((r) => !r && undefined);
    }
  }

  getStockStatus(): {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  } {
    const stock = this.product()?.stockQuantity ?? 0;
    if (stock === 0) {
      return { label: 'Agotado', variant: 'destructive' };
    } else if (stock <= 5) {
      return { label: `Pocas unidades (${ stock } disponibles)`, variant: 'secondary' };
    } else {
      return { label: `En stock (${ stock } disponibles)`, variant: 'default' };
    }
  }

  isOutOfStock(): boolean {
    return (this.product()?.stockQuantity ?? 0) === 0;
  }

  getFormattedDescription(): string[] {
    const description = this.product()?.description;
    if (!description) return [];
    return description.split('\n').filter((line) => line.trim() !== '');
  }
}
