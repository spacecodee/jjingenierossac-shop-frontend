import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateSupplierRequest } from '@features/dashboard/data/models/create-supplier-request.interface';
import { Supplier } from '@features/dashboard/data/services/supplier/supplier';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideSave } from '@ng-icons/lucide';
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
  selector: 'app-supplier-form',
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
    }),
  ],
  templateUrl: './supplier-form.html',
  styleUrl: './supplier-form.css',
})
export class SupplierForm {
  private readonly fb = inject(FormBuilder);
  private readonly supplierService = inject(Supplier);
  private readonly router = inject(Router);

  readonly isSubmitting = signal<boolean>(false);
  readonly supplierForm: FormGroup;

  readonly nameCharCount = signal<number>(0);
  readonly taxIdCharCount = signal<number>(0);
  readonly contactPersonCharCount = signal<number>(0);
  readonly emailCharCount = signal<number>(0);
  readonly phoneNumberCharCount = signal<number>(0);
  readonly addressCharCount = signal<number>(0);
  readonly websiteCharCount = signal<number>(0);

  readonly pageTitle = computed(() => 'Crear Proveedor');
  readonly pageDescription = computed(() => 'Registra un nuevo proveedor en el sistema');

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
    });

    this.supplierForm.get('taxId')?.valueChanges.subscribe((value) => {
      this.taxIdCharCount.set((value || '').length);
    });

    this.supplierForm.get('contactPerson')?.valueChanges.subscribe((value) => {
      this.contactPersonCharCount.set((value || '').length);
    });

    this.supplierForm.get('email')?.valueChanges.subscribe((value) => {
      this.emailCharCount.set((value || '').length);
    });

    this.supplierForm.get('phoneNumber')?.valueChanges.subscribe((value) => {
      this.phoneNumberCharCount.set((value || '').length);
    });

    this.supplierForm.get('address')?.valueChanges.subscribe((value) => {
      this.addressCharCount.set((value || '').length);
    });

    this.supplierForm.get('website')?.valueChanges.subscribe((value) => {
      this.websiteCharCount.set((value || '').length);
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

    this.isSubmitting.set(true);

    const formValue = this.supplierForm.value;
    const request: CreateSupplierRequest = {
      name: formValue.name.trim(),
      taxId: formValue.taxId?.trim() || undefined,
      contactPerson: formValue.contactPerson?.trim() || undefined,
      email: formValue.email?.trim() || undefined,
      phoneNumber: formValue.phoneNumber?.trim() || undefined,
      address: formValue.address?.trim() || undefined,
      website: formValue.website?.trim() || undefined,
    };

    this.createSupplier(request);
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
