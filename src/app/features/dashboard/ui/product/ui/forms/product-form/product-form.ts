import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateProductRequest } from '@features/dashboard/data/models/create-product-request.interface';
import { ProductResponse } from '@features/dashboard/data/models/product-response.interface';
import { UpdateProductRequest } from '@features/dashboard/data/models/update-product-request.interface';
import { Product } from '@features/dashboard/data/services/product/product';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideImage,
  lucideSave,
  lucideTrash2,
  lucideTriangleAlert,
  lucideUpload,
} from '@ng-icons/lucide';
import {
  ProductCategoryAutocomplete
} from '@shared/components/product-category-autocomplete/product-category-autocomplete';
import { SubcategoryAutocomplete } from '@shared/components/subcategory-autocomplete/subcategory-autocomplete';
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
  selector: 'app-product-form',
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
    SubcategoryAutocomplete,
    NgIcon,
    ...HlmIconImports,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideSave,
      lucideTriangleAlert,
      lucideUpload,
      lucideImage,
      lucideTrash2,
    }),
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(Product);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly productId = signal<number | null>(null);
  readonly isEditMode = computed(() => this.productId() !== null);
  readonly isInactive = signal<boolean>(false);
  readonly isSubcategoryInactive = signal<boolean>(false);
  readonly isCategoryInactive = signal<boolean>(false);
  readonly productForm: FormGroup;

  readonly nameCharCount = signal<number>(0);
  readonly brandCharCount = signal<number>(0);
  readonly descriptionCharCount = signal<number>(0);
  readonly skuCharCount = signal<number>(0);
  readonly selectedCategoryId = signal<number | null>(null);
  readonly selectedSubcategoryId = signal<number | null>(null);

  readonly imageFile = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);
  readonly imageSize = signal<number>(0);
  readonly currentImageUrl = signal<string | null>(null);

  readonly originalName = signal<string>('');
  readonly originalBrand = signal<string>('');
  readonly originalDescription = signal<string>('');
  readonly originalPrice = signal<number>(0);
  readonly originalStockQuantity = signal<number>(0);
  readonly originalSku = signal<string>('');
  readonly originalSubcategoryId = signal<number | null>(null);
  readonly originalImageUrl = signal<string | null>(null);

  private readonly formChanged = signal<number>(0);

  readonly hasChanges = computed(() => {
    if (!this.isEditMode()) {
      return true;
    }

    this.formChanged();
    const currentName = this.productForm.get('name')?.value?.trim() || '';
    const currentBrand = this.productForm.get('brand')?.value?.trim() || '';
    const currentDescription = this.productForm.get('description')?.value?.trim() || '';
    const currentPrice = this.productForm.get('price')?.value || 0;
    const currentStockQuantity = this.productForm.get('stockQuantity')?.value || 0;
    const currentSku = this.productForm.get('sku')?.value?.trim() || '';
    const currentSubcategoryId = this.selectedSubcategoryId();
    const hasNewImage = this.imageFile() !== null;

    return (
      currentName !== this.originalName() ||
      currentBrand !== this.originalBrand() ||
      currentDescription !== this.originalDescription() ||
      currentPrice !== this.originalPrice() ||
      currentStockQuantity !== this.originalStockQuantity() ||
      currentSku !== this.originalSku() ||
      currentSubcategoryId !== this.originalSubcategoryId() ||
      hasNewImage
    );
  });

  readonly pageTitle = computed(() => (this.isEditMode() ? 'Editar Producto' : 'Crear Producto'));

  readonly pageDescription = computed(() =>
    this.isEditMode()
      ? 'Modifica los detalles del producto'
      : 'Ingresa los detalles del nuevo producto'
  );

  readonly maxImageSizeMB = 5;
  readonly maxImageSizeBytes = this.maxImageSizeMB * 1024 * 1024;
  readonly acceptedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      brand: ['', [Validators.maxLength(100)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      sku: ['', [Validators.maxLength(100)]],
    });

    this.productForm.get('name')?.valueChanges.subscribe((value) => {
      this.nameCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.productForm.get('brand')?.valueChanges.subscribe((value) => {
      this.brandCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.productForm.get('description')?.valueChanges.subscribe((value) => {
      this.descriptionCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.productForm.get('sku')?.valueChanges.subscribe((value) => {
      this.skuCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.productForm.get('price')?.valueChanges.subscribe(() => {
      this.formChanged.update((v) => v + 1);
    });

    this.productForm.get('stockQuantity')?.valueChanges.subscribe(() => {
      this.formChanged.update((v) => v + 1);
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productId.set(+id);
      this.loadProduct(+id);
    }
  }

  private loadProduct(id: number): void {
    this.isLoading.set(true);

    this.productService.findProductById(id).subscribe({
      next: (response) => {
        const product: ProductResponse = response.data;

        this.originalName.set(product.name);
        this.originalBrand.set(product.brand || '');
        this.originalDescription.set(product.description || '');
        this.originalPrice.set(product.price);
        this.originalStockQuantity.set(product.stockQuantity);
        this.originalSku.set(product.sku || '');
        this.originalSubcategoryId.set(product.subcategory.subcategoryId);
        this.originalImageUrl.set(product.imageUrl || null);

        this.productForm.patchValue({
          name: product.name,
          brand: product.brand || '',
          description: product.description || '',
          price: product.price,
          stockQuantity: product.stockQuantity,
          sku: product.sku || '',
        });

        this.selectedCategoryId.set(product.subcategory.category.categoryId);
        this.selectedSubcategoryId.set(product.subcategory.subcategoryId);
        this.currentImageUrl.set(product.imageUrl || null);

        this.nameCharCount.set(product.name.length);
        this.brandCharCount.set((product.brand || '').length);
        this.descriptionCharCount.set((product.description || '').length);
        this.skuCharCount.set((product.sku || '').length);

        this.isSubcategoryInactive.set(!product.subcategory.subcategoryIsActive);
        this.isCategoryInactive.set(!product.subcategory.category.categoryIsActive);

        if (product.isActive) {
          toast.success('Producto cargado', {
            description: response.message || 'Los datos del producto se han cargado correctamente',
          });

          if (this.isSubcategoryInactive()) {
            toast.warning('Subcategoría inactiva', {
              description:
                'La subcategoría de este producto está inactiva. Considere reasignar a una subcategoría activa.',
            });
          }

          if (this.isCategoryInactive()) {
            toast.warning('Categoría inactiva', {
              description:
                'La categoría padre está inactiva. No se puede activar el producto mientras la jerarquía esté inactiva.',
            });
          }
        } else {
          this.isInactive.set(true);
          this.productForm.disable();
          toast.warning('Producto desactivado', {
            description:
              'Este producto está inactivo. Para poder editarlo, primero debe activarlo desde el listado de productos.',
          });
        }

        this.isLoading.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);

        let errorMessage = 'No se pudo cargar el producto';

        if (error.status === 404) {
          errorMessage = 'Producto no encontrado';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos suficientes para realizar esta acción';
        } else if (error.status === 401) {
          toast.error('Error al cargar producto', {
            description: 'Sesión expirada. Por favor, inicia sesión nuevamente',
          });
          this.router.navigate(['/auth/login']).then((r) => !r && undefined);
          return;
        } else if (error.status === 400) {
          errorMessage = 'ID de producto inválido';
        }

        toast.error('Error al cargar producto', {
          description: error.message || errorMessage,
        });

        this.router.navigate(['/dashboard/products']).then((r) => !r && undefined);
      },
    });
  }

  onCategorySelected(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    if (categoryId === null) {
      this.selectedSubcategoryId.set(null);
    }
    this.formChanged.update((v) => v + 1);
  }

  onSubcategorySelected(subcategoryId: number | null): void {
    this.selectedSubcategoryId.set(subcategoryId);
    this.formChanged.update((v) => v + 1);
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!this.acceptedImageTypes.includes(file.type)) {
      toast.error('Formato de imagen no válido', {
        description: 'Solo se permiten archivos JPG, JPEG, PNG y WEBP',
      });
      input.value = '';
      return;
    }

    if (file.size > this.maxImageSizeBytes) {
      toast.error('Imagen demasiado grande', {
        description: `El tamaño máximo permitido es ${ this.maxImageSizeMB }MB`,
      });
      input.value = '';
      return;
    }

    this.imageFile.set(file);
    this.imageSize.set(file.size);

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    this.formChanged.update((v) => v + 1);
  }

  onRemoveImage(): void {
    this.imageFile.set(null);
    this.imagePreview.set(null);
    this.imageSize.set(0);
    this.currentImageUrl.set(null);

    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    this.formChanged.update((v) => v + 1);
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      toast.error('Formulario inválido', {
        description: 'Por favor, corrige los errores antes de continuar',
      });
      return;
    }

    if (this.selectedSubcategoryId() === null) {
      toast.error('Subcategoría requerida', {
        description: 'Debe seleccionar una categoría y subcategoría de producto',
      });
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.productForm.value;
    const request: CreateProductRequest | UpdateProductRequest = {
      name: formValue.name.trim(),
      brand: formValue.brand?.trim() || undefined,
      description: formValue.description?.trim() || undefined,
      price: +formValue.price,
      stockQuantity: +formValue.stockQuantity,
      sku: formValue.sku?.trim() || undefined,
      subcategoryId: this.selectedSubcategoryId()!,
      image: this.imageFile() || undefined,
    };

    if (this.isEditMode()) {
      this.updateProduct(request as UpdateProductRequest);
    } else {
      this.createProduct(request as CreateProductRequest);
    }
  }

  private createProduct(request: CreateProductRequest): void {
    const toastMessage = request.image
      ? 'Subiendo imagen y creando producto...'
      : 'Creando producto...';

    toast.loading(toastMessage);

    this.productService.createProduct(request).subscribe({
      next: (response) => {
        toast.dismiss();
        toast.success('Producto creado exitosamente', {
          description: response.message,
        });
        this.router.navigate(['/dashboard/products']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        toast.dismiss();
        this.isSubmitting.set(false);

        if (error.status === 409) {
          this.productForm.get('name')?.setErrors({ duplicate: true });
        }

        toast.error('Error al crear producto', {
          description: error.message || 'No se pudo crear el producto',
        });
      },
    });
  }

  private updateProduct(request: UpdateProductRequest): void {
    const id = this.productId();
    if (!id) return;

    const toastMessage = request.image
      ? 'Subiendo imagen y actualizando producto...'
      : 'Actualizando producto...';

    toast.loading(toastMessage);

    this.productService.updateProduct(id, request).subscribe({
      next: (response) => {
        toast.dismiss();
        toast.success('Producto actualizado exitosamente', {
          description: response.message,
        });
        this.router.navigate(['/dashboard/products']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        toast.dismiss();
        this.isSubmitting.set(false);

        if (error.status === 409) {
          this.productForm.get('name')?.setErrors({ duplicate: true });
        }

        toast.error('Error al actualizar producto', {
          description: error.message || 'No se pudo actualizar el producto',
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/products']).then((r) => !r && undefined);
  }

  getNameError(): string | null {
    const control = this.productForm.get('name');

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
      return 'Ya existe un producto con este nombre';
    }

    return null;
  }

  getBrandError(): string | null {
    const control = this.productForm.get('brand');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('maxlength')) {
      return 'La marca no puede exceder 100 caracteres';
    }

    return null;
  }

  getPriceError(): string | null {
    const control = this.productForm.get('price');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('required')) {
      return 'El precio es obligatorio';
    }

    if (control?.hasError('min')) {
      return 'El precio debe ser mayor o igual a 0';
    }

    return null;
  }

  getStockQuantityError(): string | null {
    const control = this.productForm.get('stockQuantity');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('required')) {
      return 'La cantidad en stock es obligatoria';
    }

    if (control?.hasError('min')) {
      return 'La cantidad en stock debe ser mayor o igual a 0';
    }

    return null;
  }

  getSkuError(): string | null {
    const control = this.productForm.get('sku');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('maxlength')) {
      return 'El SKU no puede exceder 100 caracteres';
    }

    return null;
  }

  getSubcategoryError(): string | null {
    if (this.selectedSubcategoryId() === null && this.productForm.touched) {
      return 'Debe seleccionar una categoría y subcategoría de producto';
    }

    return null;
  }
}
