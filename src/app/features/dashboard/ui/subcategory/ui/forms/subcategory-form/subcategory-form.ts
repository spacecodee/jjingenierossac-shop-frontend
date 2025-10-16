import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateSubcategoryRequest } from '@features/dashboard/data/models/create-subcategory-request.interface';
import { SubcategoryResponse } from '@features/dashboard/data/models/subcategory-response.interface';
import { UpdateSubcategoryRequest } from '@features/dashboard/data/models/update-subcategory-request.interface';
import { Subcategory } from '@features/dashboard/data/services/subcategory/subcategory';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideSave, lucideTriangleAlert } from '@ng-icons/lucide';
import {
  ProductCategoryAutocomplete
} from '@shared/components/product-category-autocomplete/product-category-autocomplete';
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
  selector: 'app-subcategory-form',
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
    ProductCategoryAutocomplete,
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
  templateUrl: './subcategory-form.html',
  styleUrl: './subcategory-form.css',
})
export class SubcategoryForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly subcategoryService = inject(Subcategory);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly subcategoryId = signal<number | null>(null);
  readonly isEditMode = computed(() => this.subcategoryId() !== null);
  readonly isInactive = signal<boolean>(false);
  readonly subcategoryForm: FormGroup;

  readonly nameCharCount = signal<number>(0);
  readonly descriptionCharCount = signal<number>(0);
  readonly selectedCategoryId = signal<number | null>(null);

  readonly originalName = signal<string>('');
  readonly originalDescription = signal<string>('');
  readonly originalCategoryId = signal<number | null>(null);

  private readonly formChanged = signal<number>(0);

  readonly hasChanges = computed(() => {
    if (!this.isEditMode()) {
      return true;
    }

    this.formChanged();
    const currentName = this.subcategoryForm.get('name')?.value?.trim() || '';
    const currentDescription = this.subcategoryForm.get('description')?.value?.trim() || '';
    const currentCategoryId = this.selectedCategoryId();

    return (
      currentName !== this.originalName() ||
      currentDescription !== this.originalDescription() ||
      currentCategoryId !== this.originalCategoryId()
    );
  });

  readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Editar Subcategoría' : 'Crear Subcategoría'
  );

  readonly pageDescription = computed(() =>
    this.isEditMode()
      ? 'Modifica los detalles de la subcategoría'
      : 'Ingresa los detalles de la nueva subcategoría'
  );

  constructor() {
    this.subcategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
    });

    this.subcategoryForm.get('name')?.valueChanges.subscribe((value) => {
      this.nameCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.subcategoryForm.get('description')?.valueChanges.subscribe((value) => {
      this.descriptionCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.subcategoryId.set(+id);
      this.loadSubcategory(+id);
    }
  }

  private loadSubcategory(id: number): void {
    this.isLoading.set(true);

    this.subcategoryService.findSubcategoryById(id).subscribe({
      next: (response) => {
        const subcategory: SubcategoryResponse = response.data;

        this.originalName.set(subcategory.name);
        this.originalDescription.set(subcategory.description || '');
        this.originalCategoryId.set(subcategory.category.categoryId);

        this.subcategoryForm.patchValue({
          name: subcategory.name,
          description: subcategory.description || '',
        });

        this.selectedCategoryId.set(subcategory.category.categoryId);

        this.nameCharCount.set(subcategory.name.length);
        this.descriptionCharCount.set((subcategory.description || '').length);

        if (subcategory.isActive) {
          toast.success('Subcategoría cargada', {
            description:
              response.message || 'Los datos de la subcategoría se han cargado correctamente',
          });
        } else {
          this.isInactive.set(true);
          this.subcategoryForm.disable();
          toast.warning('Subcategoría desactivada', {
            description:
              'Esta subcategoría está inactiva. Para poder editarla, primero debe activarla desde el listado de subcategorías.',
          });
        }

        this.isLoading.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);

        let errorMessage = 'No se pudo cargar la subcategoría';

        if (error.status === 404) {
          errorMessage = 'Subcategoría no encontrada';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos suficientes para realizar esta acción';
        } else if (error.status === 401) {
          toast.error('Error al cargar subcategoría', {
            description: 'Sesión expirada. Por favor, inicia sesión nuevamente',
          });
          this.router.navigate(['/auth/login']).then((r) => !r && undefined);
          return;
        } else if (error.status === 400) {
          errorMessage = 'ID de subcategoría inválido';
        }

        toast.error('Error al cargar subcategoría', {
          description: error.message || errorMessage,
        });

        this.router.navigate(['/dashboard/subcategories']).then((r) => !r && undefined);
      },
    });
  }

  onCategorySelected(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    this.formChanged.update((v) => v + 1);
  }

  onSubmit(): void {
    if (this.subcategoryForm.invalid) {
      this.subcategoryForm.markAllAsTouched();
      toast.error('Formulario inválido', {
        description: 'Por favor, corrige los errores antes de continuar',
      });
      return;
    }

    if (this.selectedCategoryId() === null) {
      toast.error('Categoría requerida', {
        description: 'Debe seleccionar una categoría de producto',
      });
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.subcategoryForm.value;
    const request: CreateSubcategoryRequest | UpdateSubcategoryRequest = {
      name: formValue.name.trim(),
      description: formValue.description?.trim() || undefined,
      categoryId: this.selectedCategoryId()!,
    };

    if (this.isEditMode()) {
      this.updateSubcategory(request as UpdateSubcategoryRequest);
    } else {
      this.createSubcategory(request as CreateSubcategoryRequest);
    }
  }

  private createSubcategory(request: CreateSubcategoryRequest): void {
    this.subcategoryService.createSubcategory(request).subscribe({
      next: (response) => {
        toast.success('Subcategoría creada exitosamente', {
          description: response.message,
        });
        this.router.navigate(['/dashboard/subcategories']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isSubmitting.set(false);

        if (error.status === 409) {
          this.subcategoryForm.get('name')?.setErrors({ duplicate: true });
        }

        toast.error('Error al crear subcategoría', {
          description: error.message || 'No se pudo crear la subcategoría',
        });
      },
    });
  }

  private updateSubcategory(request: UpdateSubcategoryRequest): void {
    const id = this.subcategoryId();
    if (!id) return;

    this.subcategoryService.updateSubcategory(id, request).subscribe({
      next: (response) => {
        toast.success('Subcategoría actualizada exitosamente', {
          description: response.message,
        });
        this.router.navigate(['/dashboard/subcategories']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isSubmitting.set(false);

        if (error.status === 409) {
          this.subcategoryForm.get('name')?.setErrors({ duplicate: true });
        }

        toast.error('Error al actualizar subcategoría', {
          description: error.message || 'No se pudo actualizar la subcategoría',
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/subcategories']).then((r) => !r && undefined);
  }

  getNameError(): string | null {
    const control = this.subcategoryForm.get('name');

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
      return 'Ya existe una subcategoría con este nombre en esta categoría';
    }

    return null;
  }

  getCategoryError(): string | null {
    if (this.selectedCategoryId() === null && this.subcategoryForm.touched) {
      return 'Debe seleccionar una categoría de producto';
    }

    return null;
  }
}
