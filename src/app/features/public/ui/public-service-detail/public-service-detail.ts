import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicServiceDetailResponse } from '@features/public/data/models/public-service-detail-response.interface';
import { PublicServiceApiService } from '@features/public/data/services/public-service/public-service-api';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideCalendarClock,
  lucideFileText,
  lucideFolderOpen,
  lucideRefreshCw,
  lucideTag,
} from '@ng-icons/lucide';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-public-service-detail',
  imports: [
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmBadgeImports,
    ...HlmIconImports,
    HlmSeparator,
    HlmSkeleton,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideTag,
      lucideFileText,
      lucideCalendarClock,
      lucideFolderOpen,
      lucideRefreshCw,
    }),
  ],
  templateUrl: './public-service-detail.html',
})
export class PublicServiceDetail implements OnInit {
  private readonly publicServiceApi = inject(PublicServiceApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly service = signal<PublicServiceDetailResponse | null>(null);
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly serviceId = signal<number | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id && !Number.isNaN(+id) && +id > 0) {
        this.serviceId.set(+id);
        this.loadServiceDetail(+id);
      } else {
        this.handleInvalidId();
      }
    });
  }

  loadServiceDetail(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.publicServiceApi.getPublicServiceById(id).subscribe({
      next: (response) => {
        this.service.set(response.data);
        this.isLoading.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);
        this.error.set(error.message || 'No se pudo cargar el servicio');
        toast.error('Error al cargar el servicio', {
          description: error.message || 'No se pudo cargar la información del servicio',
        });
      },
    });
  }

  handleInvalidId(): void {
    this.isLoading.set(false);
    this.error.set('El identificador del servicio no es válido');
    toast.error('Error', {
      description: 'El identificador del servicio debe ser un número válido',
    });
  }

  onRetry(): void {
    const id = this.serviceId();
    if (id) {
      this.loadServiceDetail(id);
    }
  }

  onBackToCatalog(): void {
    this.router.navigate(['/public/services']).then(r => !r && undefined);
  }

  onRequestQuote(): void {
    toast.info('Funcionalidad próximamente', {
      description: 'El formulario de cotización estará disponible pronto',
    });
  }

  onViewCategory(): void {
    const categoryId = this.service()?.serviceCategory.serviceCategoryId;
    if (categoryId) {
      this.router.navigate(['/public/services'], {
        queryParams: { category: categoryId },
      }).then(r => !r && undefined);
    }
  }

  getFormattedDescription(): string[] {
    const description = this.service()?.description;
    if (!description) return [];
    return description.split('\n').filter((line) => line.trim() !== '');
  }
}
