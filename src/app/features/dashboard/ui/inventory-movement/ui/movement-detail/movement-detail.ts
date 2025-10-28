import { DatePipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Component, computed, inject, LOCALE_ID, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovementType } from '@features/dashboard/data/models/movement-type.enum';
import { StockMovementDetailResponse } from '@features/dashboard/data/models/stock-movement-detail-response.interface';
import { StockMovementService } from '@features/dashboard/data/services/stock-movement/stock-movement';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideBox,
  lucideCalendar,
  lucideFileText,
  lucidePackage,
  lucideShoppingCart,
  lucideTruck,
  lucideUser,
} from '@ng-icons/lucide';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { toast } from 'ngx-sonner';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-movement-detail',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmBadgeImports,
    ...HlmIconImports,
    NgIcon,
    HlmSeparator,
    HlmSkeleton,
    DatePipe,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-PE' },
    provideIcons({
      lucideArrowLeft,
      lucideBox,
      lucidePackage,
      lucideUser,
      lucideTruck,
      lucideShoppingCart,
      lucideCalendar,
      lucideFileText,
    }),
  ],
  templateUrl: './movement-detail.html',
})
export class MovementDetail implements OnInit, OnDestroy {
  constructor() {
    registerLocaleData(localeEs, 'es-PE');
  }

  private readonly movementService = inject(StockMovementService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private routeSubscription?: Subscription;

  readonly movement = signal<StockMovementDetailResponse | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly notFound = signal<boolean>(false);

  readonly hasSupplier = computed(() => {
    const mov = this.movement();
    return mov?.supplier !== null && mov?.supplier !== undefined;
  });

  readonly hasReservation = computed(() => {
    const mov = this.movement();
    return mov?.reservationId !== null && mov?.reservationId !== undefined;
  });

  readonly hasUser = computed(() => {
    const mov = this.movement();
    return mov?.user !== null && mov?.user !== undefined;
  });

  readonly hasNotes = computed(() => {
    const mov = this.movement();
    return mov?.notes !== null && mov?.notes !== undefined && mov.notes.trim() !== '';
  });

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadMovementDetail(+id);
      } else {
        this.notFound.set(true);
        this.isLoading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  loadMovementDetail(id: number): void {
    this.isLoading.set(true);
    this.notFound.set(false);

    this.movementService.getMovementById(id).subscribe({
      next: (response) => {
        this.movement.set(response.data);
        this.isLoading.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);

        if (error.status === 404) {
          this.notFound.set(true);
        } else {
          toast.error('Error al cargar movimiento', {
            description: error.message || 'No se pudo cargar el detalle del movimiento',
          });
          this.goBack();
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/inventory-movements']).then(r => !r && undefined);
  }

  getMovementTypeBadgeVariant(
    type: MovementType
  ): 'default' | 'destructive' | 'outline' | 'secondary' {
    switch (type) {
      case MovementType.STOCK_IN:
        return 'default';
      case MovementType.STOCK_OUT:
        return 'destructive';
      case MovementType.INITIAL:
        return 'secondary';
      case MovementType.ADJUSTMENT:
        return 'outline';
      default:
        return 'secondary';
    }
  }

  getMovementTypeLabel(type: MovementType): string {
    switch (type) {
      case MovementType.STOCK_IN:
        return 'Entrada de Inventario';
      case MovementType.STOCK_OUT:
        return 'Salida de Inventario';
      case MovementType.INITIAL:
        return 'Inventario Inicial';
      case MovementType.ADJUSTMENT:
        return 'Ajuste de Inventario';
      default:
        return type;
    }
  }

  getQuantityClass(quantity: number): string {
    return quantity > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
  }

  formatQuantity(quantity: number): string {
    return quantity > 0 ? `+${ quantity }` : `${ quantity }`;
  }
}
