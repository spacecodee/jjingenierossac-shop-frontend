import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupplierSelectResponse } from '@features/dashboard/data/models/supplier-select-response.interface';
import { Supplier } from '@features/dashboard/data/services/supplier/supplier';
import { ApiErrorResponse } from '@shared/data/models/api-error-response.interface';
import { HlmAutocomplete } from '@spartan-ng/helm/autocomplete';
import { toast } from 'ngx-sonner';
import { debounceTime, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-supplier-autocomplete',
  imports: [HlmAutocomplete, FormsModule],
  templateUrl: './supplier-autocomplete.html',
})
export class SupplierAutocomplete implements OnInit, OnDestroy {
  private readonly supplierService = inject(Supplier);
  private readonly supplierSearchSubject = new Subject<string>();
  private supplierSearchSubscription?: Subscription;

  readonly placeholder = input<string>('Busca un proveedor...');
  readonly initialSupplierId = input<number | null>(null);
  readonly disabled = input<boolean>(false);

  readonly supplierSelected = output<number | null>();

  readonly suppliers = signal<SupplierSelectResponse[]>([]);
  readonly isLoadingSuppliers = signal<boolean>(false);
  readonly supplierSearch = signal<string>('');
  readonly supplierNames = computed(() => this.suppliers().map((s) => s.displayText));

  ngOnInit(): void {
    this.loadSuppliers();

    this.supplierSearchSubscription = this.supplierSearchSubject
    .pipe(debounceTime(500))
    .subscribe((searchTerm) => {
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        this.loadSuppliers(searchTerm);
      }
    });

    const supplierId = this.initialSupplierId();
    if (supplierId !== null) {
      this.loadAndSelectInitialSupplier(supplierId);
    }
  }

  ngOnDestroy(): void {
    this.supplierSearchSubscription?.unsubscribe();
  }

  loadSuppliers(search?: string): void {
    this.isLoadingSuppliers.set(true);
    this.supplierService.getSuppliersForSelect(search).subscribe({
      next: (response) => {
        this.suppliers.set(response.data);
        this.isLoadingSuppliers.set(false);
      },
      error: (error: ApiErrorResponse) => {
        this.isLoadingSuppliers.set(false);
        toast.error('Error al cargar proveedores', {
          description: error.message || 'No se pudieron cargar los proveedores',
        });
      },
    });
  }

  loadAndSelectInitialSupplier(supplierId: number): void {
    const supplier = this.suppliers().find((s) => s.supplierId === supplierId);
    if (supplier) {
      this.supplierSearch.set(supplier.displayText);
    } else {
      this.supplierService.getSuppliersForSelect().subscribe({
        next: (response) => {
          const foundSupplier = response.data.find((s) => s.supplierId === supplierId);
          if (foundSupplier) {
            this.suppliers.set(response.data);
            this.supplierSearch.set(foundSupplier.displayText);
          }
        },
      });
    }
  }

  onSupplierSelect(supplierName: string | null): void {
    if (supplierName) {
      const supplier = this.suppliers().find((s) => s.displayText === supplierName);
      if (supplier) {
        this.supplierSelected.emit(supplier.supplierId);
      }
    } else {
      this.supplierSelected.emit(null);
    }
  }

  onSupplierSearchChange(searchTerm: string): void {
    this.supplierSearch.set(searchTerm);

    const isExactMatch = this.suppliers().some((s) => s.displayText === searchTerm);
    if (!isExactMatch) {
      this.supplierSearchSubject.next(searchTerm);
    }
  }

  reset(): void {
    this.supplierSearch.set('');
    this.supplierSelected.emit(null);
  }
}
