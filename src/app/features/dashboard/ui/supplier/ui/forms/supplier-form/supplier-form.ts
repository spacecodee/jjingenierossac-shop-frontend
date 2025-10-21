import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateSupplierRequest } from '@features/dashboard/data/models/create-supplier-request.interface';
import { SupplierResponse } from '@features/dashboard/data/models/supplier-response.interface';
import { UpdateSupplierRequest } from '@features/dashboard/data/models/update-supplier-request.interface';
import { Supplier } from '@features/dashboard/data/services/supplier/supplier';
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
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-supplier-form',
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
  templateUrl: './supplier-form.html',
  styleUrl: './supplier-form.css',
})
export class SupplierForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly supplierService = inject(Supplier);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly supplierId = signal<number | null>(null);
  readonly isEditMode = computed(() => this.supplierId() !== null);
  readonly isInactive = signal<boolean>(false);
  readonly supplierForm: FormGroup;

  readonly originalName = signal<string>('');
  readonly originalTaxId = signal<string>('');
  readonly originalContactPerson = signal<string>('');
  readonly originalEmail = signal<string>('');
  readonly originalPhoneNumber = signal<string>('');
  readonly originalAddress = signal<string>('');
  readonly originalWebsite = signal<string>('');

  readonly nameCharCount = signal<number>(0);
  readonly taxIdCharCount = signal<number>(0);
  readonly contactPersonCharCount = signal<number>(0);
  readonly emailCharCount = signal<number>(0);
  readonly phoneNumberCharCount = signal<number>(0);
  readonly addressCharCount = signal<number>(0);
  readonly websiteCharCount = signal<number>(0);
  private readonly formChanged = signal<number>(0);

  readonly hasChanges = computed(() => {
    if (!this.isEditMode()) {
      return true;
    }

    this.formChanged();
    const currentName = this.supplierForm.get('name')?.value?.trim() || '';
    const currentTaxId = this.supplierForm.get('taxId')?.value?.trim() || '';
    const currentContactPerson = this.supplierForm.get('contactPerson')?.value?.trim() || '';
    const currentEmail = this.supplierForm.get('email')?.value?.trim() || '';
    const currentPhoneNumber = this.supplierForm.get('phoneNumber')?.value?.trim() || '';
    const currentAddress = this.supplierForm.get('address')?.value?.trim() || '';
    const currentWebsite = this.supplierForm.get('website')?.value?.trim() || '';

    return (
      currentName !== this.originalName() ||
      currentTaxId !== this.originalTaxId() ||
      currentContactPerson !== this.originalContactPerson() ||
      currentEmail !== this.originalEmail() ||
      currentPhoneNumber !== this.originalPhoneNumber() ||
      currentAddress !== this.originalAddress() ||
      currentWebsite !== this.originalWebsite()
    );
  });

  readonly pageTitle = computed(() => (this.isEditMode() ? 'Editar Proveedor' : 'Crear Proveedor'));

  readonly pageDescription = computed(() =>
    this.isEditMode()
      ? 'Modifica los datos del proveedor'
      : 'Registra un nuevo proveedor en el sistema'
  );

  constructor() {
    this.supplierForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      taxId: ['', [Validators.maxLength(20)]],
      contactPerson: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(255)]],
      phoneNumber: ['', [Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(500)]],
      website: [
        '',
        [Validators.maxLength(255), Validators.pattern(/^(https?:\/\/)[\w-]+(\.[\w-]+)+[/#?]?.*$/)],
      ],
    });

    this.supplierForm.get('name')?.valueChanges.subscribe((value) => {
      this.nameCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.supplierForm.get('taxId')?.valueChanges.subscribe((value) => {
      this.taxIdCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.supplierForm.get('contactPerson')?.valueChanges.subscribe((value) => {
      this.contactPersonCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.supplierForm.get('email')?.valueChanges.subscribe((value) => {
      this.emailCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.supplierForm.get('phoneNumber')?.valueChanges.subscribe((value) => {
      this.phoneNumberCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.supplierForm.get('address')?.valueChanges.subscribe((value) => {
      this.addressCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });

    this.supplierForm.get('website')?.valueChanges.subscribe((value) => {
      this.websiteCharCount.set((value || '').length);
      this.formChanged.update((v) => v + 1);
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.supplierId.set(+id);
      this.loadSupplier(+id);
    }
  }

  private loadSupplier(id: number): void {
    this.isLoading.set(true);

    this.supplierService.getSupplierById(id).subscribe({
      next: (response) => {
        const supplier: SupplierResponse = response.data;

        this.originalName.set(supplier.name);
        this.originalTaxId.set(supplier.taxId || '');
        this.originalContactPerson.set(supplier.contactPerson || '');
        this.originalEmail.set(supplier.email || '');
        this.originalPhoneNumber.set(supplier.phoneNumber || '');
        this.originalAddress.set(supplier.address || '');
        this.originalWebsite.set(supplier.website || '');

        this.supplierForm.patchValue({
          name: supplier.name,
          taxId: supplier.taxId,
          contactPerson: supplier.contactPerson,
          email: supplier.email,
          phoneNumber: supplier.phoneNumber,
          address: supplier.address,
          website: supplier.website,
        });

        this.nameCharCount.set(supplier.name.length);
        this.taxIdCharCount.set((supplier.taxId || '').length);
        this.contactPersonCharCount.set((supplier.contactPerson || '').length);
        this.emailCharCount.set((supplier.email || '').length);
        this.phoneNumberCharCount.set((supplier.phoneNumber || '').length);
        this.addressCharCount.set((supplier.address || '').length);
        this.websiteCharCount.set((supplier.website || '').length);

        if (supplier.isActive) {
          toast.success('Proveedor cargado', {
            description: response.message || 'Los datos del proveedor se han cargado correctamente',
          });
        } else {
          this.isInactive.set(true);
          this.supplierForm.disable();
          toast.warning('Proveedor desactivado', {
            description:
              'Este proveedor está inactivo. Para poder editarlo, primero debe activarlo desde el listado de proveedores.',
          });
        }

        this.isLoading.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoading.set(false);

        let errorMessage = 'No se pudo cargar el proveedor';

        if (error.status === 404) {
          errorMessage = 'Proveedor no encontrado';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos suficientes para realizar esta acción';
        } else if (error.status === 401) {
          toast.error('Error al cargar proveedor', {
            description: 'Sesión expirada. Por favor, inicia sesión nuevamente',
          });
          this.router.navigate(['/auth/login']).then((r) => !r && undefined);
          return;
        } else if (error.status === 400) {
          errorMessage = 'ID de proveedor inválido';
        }

        toast.error('Error al cargar proveedor', {
          description: error.message || errorMessage,
        });

        this.router.navigate(['/dashboard/suppliers']).then((r) => !r && undefined);
      },
    });
  }

  onSubmit(): void {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      toast.error('Formulario inválido', {
        description: 'Por favor, corrige los errores antes de continuar',
      });
      return;
    }

    if (this.isEditMode() && !this.hasChanges()) {
      toast.info('Sin cambios', {
        description: 'No se han realizado cambios en el proveedor',
      });
      return;
    }

    this.isSubmitting.set(true);

    if (this.isEditMode()) {
      const request = this.buildUpdateRequest();
      this.updateSupplier(request);
    } else {
      const request = this.buildCreateRequest();
      this.createSupplier(request);
    }
  }

  private buildUpdateRequest(): UpdateSupplierRequest {
    const formValue = this.supplierForm.value;
    const request: UpdateSupplierRequest = {};

    const currentName = formValue.name?.trim() || '';
    const currentTaxId = formValue.taxId?.trim() || '';
    const currentContactPerson = formValue.contactPerson?.trim() || '';
    const currentEmail = formValue.email?.trim() || '';
    const currentPhoneNumber = formValue.phoneNumber?.trim() || '';
    const currentAddress = formValue.address?.trim() || '';
    const currentWebsite = formValue.website?.trim() || '';

    if (currentName !== this.originalName()) {
      request.name = currentName;
    }
    if (currentTaxId !== this.originalTaxId()) {
      request.taxId = currentTaxId || undefined;
    }
    if (currentContactPerson !== this.originalContactPerson()) {
      request.contactPerson = currentContactPerson || undefined;
    }
    if (currentEmail !== this.originalEmail()) {
      request.email = currentEmail || undefined;
    }
    if (currentPhoneNumber !== this.originalPhoneNumber()) {
      request.phoneNumber = currentPhoneNumber || undefined;
    }
    if (currentAddress !== this.originalAddress()) {
      request.address = currentAddress || undefined;
    }
    if (currentWebsite !== this.originalWebsite()) {
      request.website = currentWebsite || undefined;
    }

    return request;
  }

  private buildCreateRequest(): CreateSupplierRequest {
    const formValue = this.supplierForm.value;

    return {
      name: formValue.name.trim(),
      taxId: formValue.taxId?.trim() || undefined,
      contactPerson: formValue.contactPerson?.trim() || undefined,
      email: formValue.email?.trim() || undefined,
      phoneNumber: formValue.phoneNumber?.trim() || undefined,
      address: formValue.address?.trim() || undefined,
      website: formValue.website?.trim() || undefined,
    };
  }

  private createSupplier(request: CreateSupplierRequest): void {
    this.supplierService.createSupplier(request).subscribe({
      next: (response) => {
        toast.success('Proveedor creado exitosamente', {
          description: response.message,
        });
        this.router.navigate(['/dashboard/suppliers']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isSubmitting.set(false);

        if (error.status === 409) {
          this.supplierForm.get('name')?.setErrors({ duplicate: true });
        }

        toast.error('Error al crear proveedor', {
          description: error.message || 'No se pudo crear el proveedor',
        });
      },
    });
  }

  private updateSupplier(request: UpdateSupplierRequest): void {
    const id = this.supplierId();
    if (!id) return;

    this.supplierService.updateSupplier(id, request).subscribe({
      next: (response) => {
        toast.success('Proveedor actualizado exitosamente', {
          description: response.message,
        });
        this.router.navigate(['/dashboard/suppliers']).then((r) => !r && undefined);
      },
      error: (error: ApiErrorResponse) => {
        this.isSubmitting.set(false);

        if (error.status === 404) {
          toast.error('Proveedor no encontrado', {
            description: 'El proveedor que intenta editar ya no existe',
          });
          this.router.navigate(['/dashboard/suppliers']).then((r) => !r && undefined);
          return;
        }

        if (error.status === 409) {
          this.supplierForm.get('name')?.setErrors({ duplicate: true });
          toast.error('Nombre duplicado', {
            description: error.message || 'Ya existe otro proveedor con este nombre',
          });
          return;
        }

        if (error.status === 422) {
          toast.error('Error de validación', {
            description: error.message || 'Los datos ingresados no son válidos',
          });
          return;
        }

        toast.error('Error al actualizar proveedor', {
          description: error.message || 'No se pudo actualizar el proveedor',
        });
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/suppliers']).then((r) => !r && undefined);
  }

  getNameError(): string | null {
    const control = this.supplierForm.get('name');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('required')) {
      return 'El nombre es obligatorio';
    }

    if (control?.hasError('maxlength')) {
      return 'El nombre no puede exceder 150 caracteres';
    }

    if (control?.hasError('duplicate')) {
      return 'Ya existe un proveedor con este nombre';
    }

    return null;
  }

  getTaxIdError(): string | null {
    const control = this.supplierForm.get('taxId');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('maxlength')) {
      return 'El RUC no puede exceder 20 caracteres';
    }

    return null;
  }

  getContactPersonError(): string | null {
    const control = this.supplierForm.get('contactPerson');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('maxlength')) {
      return 'El nombre de contacto no puede exceder 100 caracteres';
    }

    return null;
  }

  getEmailError(): string | null {
    const control = this.supplierForm.get('email');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('email')) {
      return 'Ingrese un email válido';
    }

    if (control?.hasError('maxlength')) {
      return 'El email no puede exceder 255 caracteres';
    }

    return null;
  }

  getPhoneNumberError(): string | null {
    const control = this.supplierForm.get('phoneNumber');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('maxlength')) {
      return 'El teléfono no puede exceder 20 caracteres';
    }

    return null;
  }

  getAddressError(): string | null {
    const control = this.supplierForm.get('address');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('maxlength')) {
      return 'La dirección no puede exceder 500 caracteres';
    }

    return null;
  }

  getWebsiteError(): string | null {
    const control = this.supplierForm.get('website');

    if (!control?.touched && !control?.dirty) {
      return null;
    }

    if (control?.hasError('pattern')) {
      return 'La URL debe comenzar con http:// o https://';
    }

    if (control?.hasError('maxlength')) {
      return 'La URL no puede exceder 255 caracteres';
    }

    return null;
  }
}
