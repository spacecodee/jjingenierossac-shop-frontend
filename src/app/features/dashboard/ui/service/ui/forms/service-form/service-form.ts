import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateServiceRequest } from '@features/dashboard/data/models/create-service-request.interface';
import { ServiceResponse } from '@features/dashboard/data/models/service-response.interface';
import { UpdateServiceRequest } from '@features/dashboard/data/models/update-service-request.interface';
import { ServiceApiService } from '@features/dashboard/data/services/service/service-api';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideSave, lucideTriangleAlert } from '@ng-icons/lucide';
import {
  ServiceCategoryAutocomplete
} from '@shared/components/service-category-autocomplete/service-category-autocomplete';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFormFieldImports } from '@spartan-ng/helm/form-field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-service-form',
  imports: [
    ReactiveFormsModule,
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmFormFieldImports,
    HlmInput,
    HlmLabel,
    HlmSeparator,
    HlmSkeleton,
    HlmSpinner,
    ServiceCategoryAutocomplete,
    NgIcon,
    ...HlmIconImports,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideSave,
      lucideTriangleAlert,
    }),
  ],
  templateUrl: './service-form.html',
  styleUrl: './service-form.css',
})
export class ServiceForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly serviceId = signal<number | null>(null);
  readonly isEditMode = computed(() => this.serviceId() !== null);
  readonly isInactive = signal<boolean>(false);
  readonly serviceForm: FormGroup;

  readonly nameCharCount = signal<number>(0);
  readonly descriptionCharCount = signal<number>(0);
  readonly durationCharCount = signal<number>(0);
  readonly selectedServiceCategoryId = signal<number | null>(null);

  readonly originalName = signal<string>('');
  readonly originalDescription = signal<string>('');
  readonly originalDuration = signal<string>('');
  readonly originalCategoryId = signal<number | null>(null);

  private readonly formChanged = signal<number>(0);

  readonly hasChanges = computed(() => {
    if (!this.isEditMode()) {
      return true;
    }

    this.formChanged();
    const currentName = this.serviceForm.get('name')?.value?.trim() || '';
    const currentDescription = this.serviceForm.get('description')?.value?.trim() || '';
    const currentDuration = this.serviceForm.get('estimatedDuration')?.value?.trim() || '';
    const currentCategoryId = this.selectedServiceCategoryId();

    return (
      currentName !== this.originalName() ||
      currentDescription !== this.originalDescription() ||
      currentDuration !== this.originalDuration() ||
      currentCategoryId !== this.originalCategoryId()
    );
  });

  readonly pageTitle = computed(() => (this.isEditMode() ? 'Editar Servicio' : 'Crear Servicio'));

  readonly pageDescription = computed(() =>
    this.isEditMode()
      ? 'Modifica los detalles del servicio'
      : 'Ingresa los detalles del nuevo servicio'
  );

  constructor() {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required]],
      estimatedDuration: ['', [Validators.maxLength(50)]],
    });

    this.serviceForm.get('name')?.valueChanges.subscribe((value) => {
      this.nameCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.serviceForm.get('description')?.valueChanges.subscribe((value) => {
      this.descriptionCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.serviceForm.get('estimatedDuration')?.valueChanges.subscribe((value) => {
      this.durationCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.serviceId.set(+id);
      this.loadService(+id);
    }
  }

  private loadService(id: number): void {
    this.isLoading.set(true);

    this.serviceApi.findServiceById(id).subscribe({
      next: (response) => {
        const service: ServiceResponse = response.data;

        this.originalName.set(service.name);
        this.originalDescription.set(service.description);
        this.originalDuration.set(service.estimatedDuration || '');
        this.originalCategoryId.set(service.serviceCategory.serviceCategoryId);

        this.serviceForm.patchValue({
          name: service.name,
          description: service.description,
          estimatedDuration: service.estimatedDuration || '',
        });

        this.selectedServiceCategoryId.set(service.serviceCategory.serviceCategoryId);

        this.nameCharCount.set(service.name.length);
        this.descriptionCharCount.set(service.description.length);
        this.durationCharCount.set((service.estimatedDuration || '').length);

        if (service.isActive) {
          toast.success('Servicio cargado', {
            description: response.message || 'Los datos del servicio se han cargado correctamente',
          });
        } else {
          this.isInactive.set(true);
          this.serviceForm.disable();
          toast.warning('Servicio desactivado', {
            description:
              'Este servicio está inactivo. Para poder editarlo, primero debe activarlo desde el listado de servicios.',
          });
        }

        this.isLoading.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);

        let errorMessage = 'No se pudo cargar el servicio';

        if (error.status === 404) {
          errorMessage = 'Servicio no encontrado';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos suficientes para realizar esta acción';
        } else if (error.status === 401) {
          toast.error('Error al cargar servicio', {
            description: 'Sesión expirada. Por favor, inicia sesión nuevamente',
          });
          this.router.navigate(['/auth/login']).then((r) => !r && undefined);
          return;
        } else if (error.status === 400) {
          errorMessage = 'ID de servicio inválido';
        }

        toast.error('Error al cargar servicio', {
          description: error.message || errorMessage,
        });

        this.router.navigate(['/dashboard/services']).then((r) => !r && undefined);
      },
    });
  }

  onCategorySelected(categoryId: number | null): void {
    this.selectedServiceCategoryId.set(categoryId);
    this.formChanged.update((v) => v + 1);
  }

  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      toast.error('Formulario inválido', {
        description: 'Por favor, corrige los errores antes de continuar',
      });
      return;
    }

    if (this.selectedServiceCategoryId() === null) {
      toast.error('Categoría requerida', {
        description: 'Debe seleccionar una categoría de servicio',
      });
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.serviceForm.value;
    const request: CreateServiceRequest | UpdateServiceRequest = {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      estimatedDuration: formValue.estimatedDuration?.trim() || undefined,
      serviceCategoryId: this.selectedServiceCategoryId()!,
    };

    if (this.isEditMode()) {
      this.updateService(request as UpdateServiceRequest);
    } else {
      this.createService(request as CreateServiceRequest);
    }
  }

  private createService(request: CreateServiceRequest): void {
    this.serviceApi.createService(request).subscribe({
      next: (response) => {
        toast.success('Servicio creado exitosamente', {
          description: response.message,
        });
        this.router.navigate(['/dashboard/services']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isSubmitting.set(false);

        if (error.status === 409) {
          this.serviceForm.get('name')?.setErrors({ duplicate: true });
        }

        toast.error('Error al crear servicio', {
          description: error.message || 'No se pudo crear el servicio',
        });
      },
    });
  }

  private updateService(request: UpdateServiceRequest): void {
    const id = this.serviceId();
    if (!id) return;

    this.serviceApi.updateService(id, request).subscribe({
      next: (response) => {
        toast.success('Servicio actualizado exitosamente', {
          description: response.message,
        });
        this.router.navigate(['/dashboard/services']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isSubmitting.set(false);

        if (error.status === 409) {
          this.serviceForm.get('name')?.setErrors({ duplicate: true });
        }

        toast.error('Error al actualizar servicio', {
          description: error.message || 'No se pudo actualizar el servicio',
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/services']).then((r) => !r && undefined);
  }

  getNameError(): string | null {
    const control = this.serviceForm.get('name');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('required')) {
      return 'El nombre es obligatorio';
    }

    if (control?.hasError('maxlength')) {
      return 'El nombre no puede exceder 255 caracteres';
    }

    if (control?.hasError('duplicate')) {
      return 'Ya existe un servicio con este nombre';
    }

    return null;
  }

  getDescriptionError(): string | null {
    const control = this.serviceForm.get('description');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('required')) {
      return 'La descripción es obligatoria';
    }

    return null;
  }

  getDurationError(): string | null {
    const control = this.serviceForm.get('estimatedDuration');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('maxlength')) {
      return 'La duración estimada no puede exceder 50 caracteres';
    }

    return null;
  }

  getCategoryError(): string | null {
    if (this.selectedServiceCategoryId() === null && this.serviceForm.touched) {
      return 'Debe seleccionar una categoría de servicio';
    }

    return null;
  }
}
