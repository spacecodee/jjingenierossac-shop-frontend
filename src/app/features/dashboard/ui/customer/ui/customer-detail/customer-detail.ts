import { CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Component, inject, LOCALE_ID, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CustomerDetailResponse,
  ReservationStatus,
} from '@features/dashboard/data/models/customer-detail-response.interface';
import { Customer } from '@features/dashboard/data/services/customer/customer';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCalendar,
  lucideCheck,
  lucideClock,
  lucideLock,
  lucideMail,
  lucidePhone,
  lucideShieldAlert,
  lucideShoppingBag,
  lucideUser,
  lucideX,
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
import { Subscription } from 'rxjs';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

@Component({
  selector: 'app-customer-detail',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmBadgeImports,
    ...HlmBreadCrumbImports,
    ...HlmIconImports,
    HlmSeparator,
    HlmSkeleton,
    NgIcon,
    DatePipe,
    CurrencyPipe,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-PE' },
    provideIcons({
      lucideArrowLeft,
      lucideUser,
      lucideMail,
      lucidePhone,
      lucideShieldAlert,
      lucideLock,
      lucideCalendar,
      lucideClock,
      lucideShoppingBag,
      lucideCheck,
      lucideX,
    }),
  ],
  templateUrl: './customer-detail.html',
  styleUrl: './customer-detail.css',
})
export class CustomerDetail implements OnInit, OnDestroy {
  constructor() {
    registerLocaleData(localeEs, 'es-PE');
  }

  private readonly customerService = inject(Customer);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private routeSubscription?: Subscription;

  readonly customer = signal<CustomerDetailResponse | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly notFound = signal<boolean>(false);

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id && !Number.isNaN(+id) && +id > 0) {
        this.loadCustomerDetail(+id);
      } else {
        this.notFound.set(true);
        this.isLoading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  loadCustomerDetail(id: number): void {
    this.isLoading.set(true);
    this.notFound.set(false);

    this.customerService.findCustomerById(id).subscribe({
      next: (response) => {
        this.customer.set(response.data);
        this.isLoading.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);

        if (error.status === 404) {
          this.notFound.set(true);
        } else {
          toast.error('Error al cargar cliente', {
            description: error.message || 'No se pudo cargar el detalle del cliente',
          });
          this.goBack();
        }
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/customers']).then((r) => !r && undefined);
  }

  getActiveAccountBadgeVariant(): BadgeVariant {
    return 'default';
  }

  getInactiveAccountBadgeVariant(): BadgeVariant {
    return 'destructive';
  }

  getActiveAccountLabel(): string {
    return 'Activa';
  }

  getInactiveAccountLabel(): string {
    return 'Inactiva';
  }

  getReservationStatusBadgeVariant(status: ReservationStatus): BadgeVariant {
    const statusMap: Record<ReservationStatus, BadgeVariant> = {
      RECEIVED: 'secondary',
      IN_PROCESS: 'outline',
      READY_FOR_PICKUP: 'default',
      PAID: 'default',
      COMPLETED: 'default',
      CANCELLED: 'destructive',
    };
    return statusMap[status] || 'outline';
  }

  getReservationStatusLabel(status: ReservationStatus): string {
    const statusLabels: Record<ReservationStatus, string> = {
      RECEIVED: 'Recibida',
      IN_PROCESS: 'En Proceso',
      READY_FOR_PICKUP: 'Lista para Recoger',
      PAID: 'Pagada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
    };
    return statusLabels[status] || status;
  }

  getFailedLoginAttemptsVariant(): 'default' | 'secondary' | 'destructive' {
    const attempts = this.customer()?.failedLoginAttempts ?? 0;
    if (attempts >= 8) return 'destructive';
    if (attempts >= 5) return 'secondary';
    return 'default';
  }

  formatDaysSinceLastLogin(): string {
    const days = this.customer()?.daysSinceLastLogin;
    if (days === null || days === undefined) {
      return 'Nunca ha ingresado';
    }
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Hace 1 día';
    return `Hace ${ days } días`;
  }

  formatLastPurchaseDate(): string {
    const lastPurchaseDate = this.customer()?.purchaseStats.lastPurchaseDate;
    if (!lastPurchaseDate) {
      return 'Sin compras';
    }
    const date = new Date(lastPurchaseDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 30) return `Hace ${ diffDays } días`;
    if (diffDays < 60) return 'Hace 1 mes';
    const months = Math.floor(diffDays / 30);
    return `Hace ${ months } meses`;
  }

  getCompletionRate(): number {
    const stats = this.customer()?.purchaseStats;
    if (!stats || stats.totalReservations === 0) return 0;
    return (stats.completedReservations / stats.totalReservations) * 100;
  }
}
