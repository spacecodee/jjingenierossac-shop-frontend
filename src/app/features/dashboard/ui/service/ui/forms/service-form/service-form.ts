import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateServiceRequest } from '@features/dashboard/data/models/create-service-request.interface';
import { ServiceApiService } from '@features/dashboard/data/services/service/service-api';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideSave } from '@ng-icons/lucide';
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
    HlmSpinner,
    ServiceCategoryAutocomplete,
    NgIcon,
    ...HlmIconImports,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideSave,
    }),
  ],
  templateUrl: './service-form.html',
  styleUrl: './service-form.css',
})
export class ServiceForm {
  private readonly fb = inject(FormBuilder);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal<boolean>(false);
  readonly serviceForm: FormGroup;

  readonly nameCharCount = signal<number>(0);
  readonly descriptionCharCount = signal<number>(0);
  readonly durationCharCount = signal<number>(0);
  readonly selectedServiceCategoryId = signal<number | null>(null);

  readonly pageTitle = 'Crear Servicio';
  readonly pageDescription = 'Ingresa los detalles del nuevo servicio';

  constructor() {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required]],
      estimatedDuration: ['', [Validators.maxLength(50)]],
    });

    this.serviceForm.get('name')?.valueChanges.subscribe((value) => {
      this.nameCharCount.set((value || '').length);
    });

    this.serviceForm.get('description')?.valueChanges.subscribe((value) => {
      this.descriptionCharCount.set((value || '').length);
    });

    this.serviceForm.get('estimatedDuration')?.valueChanges.subscribe((value) => {
      this.durationCharCount.set((value || '').length);
    });
  }

  onCategorySelected(categoryId: number | null): void {
    this.selectedServiceCategoryId.set(categoryId);
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
    const request: CreateServiceRequest = {
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      estimatedDuration: formValue.estimatedDuration?.trim() || undefined,
      serviceCategoryId: this.selectedServiceCategoryId()!,
    };

    this.createService(request);
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
