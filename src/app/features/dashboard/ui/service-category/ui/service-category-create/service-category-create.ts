import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CreateServiceCategoryRequest
} from '@features/dashboard/data/models/create-service-category-request.interface';
import { ServiceCategoryService } from '@features/dashboard/data/services/service-category/service-category.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideSave } from '@ng-icons/lucide';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFormFieldImports } from '@spartan-ng/helm/form-field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { toast } from 'ngx-sonner';
import { HlmIconImports } from '@spartan-ng/helm/icon';

@Component({
  selector: 'app-service-category-create',
  imports: [
    ReactiveFormsModule,
    ...HlmCardImports,
    ...HlmButtonImports,
    ...HlmFormFieldImports,
    HlmInput,
    HlmLabel,
    HlmSeparator,
    HlmSpinner,
    NgIcon,
    HlmIconImports,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideSave,
    }),
  ],
  templateUrl: './service-category-create.html',
  styleUrl: './service-category-create.css',
})
export class ServiceCategoryCreate implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly serviceCategoryService = inject(ServiceCategoryService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal<boolean>(false);
  readonly categoryForm!: FormGroup;

  readonly nameCharCount = computed(() => {
    const value = this.categoryForm?.get('name')?.value || '';
    return value.length;
  });

  readonly descriptionCharCount = computed(() => {
    const value = this.categoryForm?.get('description')?.value || '';
    return value.length;
  });

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.categoryForm.get('name')?.valueChanges.subscribe(() => {
      this.nameCharCount();
    });

    this.categoryForm.get('description')?.valueChanges.subscribe(() => {
      this.descriptionCharCount();
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      toast.error('Formulario inválido', {
        description: 'Por favor, corrige los errores antes de continuar',
      });
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.categoryForm.value;
    const request: CreateServiceCategoryRequest = {
      name: formValue.name.trim(),
      description: formValue.description?.trim() || undefined,
    };

    this.serviceCategoryService.createServiceCategory(request).subscribe({
      next: (response) => {
        toast.success('Categoría creada exitosamente', {
          description: response.message,
        });
        this.router.navigate(['/dashboard/service-categories']).then(r => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isSubmitting.set(false);

        let errorMessage = 'No se pudo crear la categoría';

        if (error.status === 409) {
          errorMessage = 'Ya existe una categoría con este nombre';
          this.categoryForm.get('name')?.setErrors({ duplicate: true });
        } else if (error.status === 422) {
          errorMessage = 'Datos inválidos. Verifica los campos';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para crear categorías';
        }

        toast.error('Error al crear categoría', {
          description: error.message || errorMessage,
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/service-categories']).then(r => !r && undefined);
  }

  getNameError(): string | null {
    const control = this.categoryForm.get('name');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('required')) {
      return 'El nombre es obligatorio';
    }

    if (control?.hasError('maxlength')) {
      return 'El nombre no puede exceder 100 caracteres';
    }

    if (control?.hasError('duplicate')) {
      return 'Ya existe una categoría con este nombre';
    }

    return null;
  }
}
