import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryResponse } from '@features/dashboard/data/models/category-response.interface';
import { CreateCategoryRequest } from '@features/dashboard/data/models/create-category-request.interface';
import { UpdateCategoryRequest } from '@features/dashboard/data/models/update-category-request.interface';
import { CategoryService } from '@features/dashboard/data/services/category/category.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideSave, lucideTriangleAlert } from '@ng-icons/lucide';
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
  selector: 'app-category-form',
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
    ...HlmIconImports,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideSave,
      lucideTriangleAlert,
    }),
  ],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly categoryId = signal<number | null>(null);
  readonly isEditMode = computed(() => this.categoryId() !== null);
  readonly isInactive = signal<boolean>(false);
  readonly categoryForm: FormGroup;

  readonly originalName = signal<string>('');
  readonly originalDescription = signal<string>('');

  readonly nameCharCount = signal<number>(0);
  readonly descriptionCharCount = signal<number>(0);
  private readonly formChanged = signal<number>(0);

  readonly hasChanges = computed(() => {
    if (!this.isEditMode()) {
      return true;
    }

    this.formChanged();
    const currentName = this.categoryForm.get('name')?.value?.trim() || '';
    const currentDescription = this.categoryForm.get('description')?.value?.trim() || '';

    return currentName !== this.originalName() || currentDescription !== this.originalDescription();
  });

  readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Editar Categoría de Producto' : 'Crear Categoría de Producto'
  );

  readonly pageDescription = computed(() =>
    this.isEditMode()
      ? 'Modifica el nombre y descripción de la categoría de producto'
      : 'Ingresa el nombre y descripción de la nueva categoría de producto'
  );

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
    });

    this.categoryForm.get('name')?.valueChanges.subscribe((value) => {
      this.nameCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.categoryForm.get('description')?.valueChanges.subscribe((value) => {
      this.descriptionCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.categoryId.set(+id);
      this.loadCategory(+id);
    }
  }

  private loadCategory(id: number): void {
    this.isLoading.set(true);

    this.categoryService.getCategoryById(id).subscribe({
      next: (response) => {
        const category: CategoryResponse = response.data;

        this.originalName.set(category.name);
        this.originalDescription.set(category.description || '');

        this.categoryForm.patchValue({
          name: category.name,
          description: category.description,
        });

        this.nameCharCount.set(category.name.length);
        this.descriptionCharCount.set((category.description || '').length);

        if (category.isActive) {
          toast.success('Categoría cargada', {
            description:
              response.message || 'Los datos de la categoría se han cargado correctamente',
          });
        } else {
          this.isInactive.set(true);
          this.categoryForm.disable();
          toast.warning('Categoría desactivada', {
            description:
              'Esta categoría está inactiva. Para poder editarla, primero debe activarla desde el listado de categorías.',
          });
        }

        this.isLoading.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);

        let errorMessage = 'No se pudo cargar la categoría';

        if (error.status === 404) {
          errorMessage = 'Categoría no encontrada';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos suficientes para realizar esta acción';
        } else if (error.status === 401) {
          toast.error('Error al cargar categoría', {
            description: 'Sesión expirada. Por favor, inicia sesión nuevamente',
          });
          this.router.navigate(['/auth/login']).then((r) => !r && undefined);
          return;
        } else if (error.status === 400) {
          errorMessage = 'ID de categoría inválido';
        }

        toast.error('Error al cargar categoría', {
          description: error.message || errorMessage,
        });

        this.router.navigate(['/dashboard/categories']).then((r) => !r && undefined);
      },
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

    if (this.isEditMode() && !this.hasChanges()) {
      toast.info('Sin cambios', {
        description: 'No se han realizado cambios en la categoría',
      });
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.categoryForm.value;
    const request: UpdateCategoryRequest = {
      name: formValue.name.trim(),
      description: formValue.description?.trim() || undefined,
    };

    if (this.isEditMode()) {
      this.updateCategory(request);
    } else {
      this.createCategory(request);
    }
  }

  private createCategory(request: CreateCategoryRequest): void {
    this.categoryService.createCategory(request).subscribe({
      next: (response) => {
        toast.success('Categoría creada exitosamente', {
          description: response.message,
        });
        this.router.navigate(['/dashboard/categories']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isSubmitting.set(false);

        if (error.status === 409) {
          this.categoryForm.get('name')?.setErrors({ duplicate: true });
        }

        toast.error('Error al crear categoría', {
          description: error.message || 'No se pudo crear la categoría',
        });
      },
    });
  }

  private updateCategory(request: UpdateCategoryRequest): void {
    const id = this.categoryId();
    if (!id) return;

    this.categoryService.updateCategory(id, request).subscribe({
      next: (response) => {
        toast.success('Categoría actualizada exitosamente', {
          description: response.message,
        });
        this.router.navigate(['/dashboard/categories']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isSubmitting.set(false);

        if (error.status === 409) {
          this.categoryForm.get('name')?.setErrors({ duplicate: true });
        }

        toast.error('Error al actualizar categoría', {
          description: error.message || 'No se pudo actualizar la categoría',
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/categories']).then((r) => !r && undefined);
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
