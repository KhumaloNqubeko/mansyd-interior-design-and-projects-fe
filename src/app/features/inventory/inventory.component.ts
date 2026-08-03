import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Material, StockTransaction, StockTransactionType, Supplier, UnitOfMeasure } from '../../core/models/inventory.models';
import { Project } from '../../core/models/project.models';
import { InventoryApiService } from '../../core/services/inventory-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProjectApiService } from '../../core/services/project-api.service';
import { ValidationMessageComponent } from '../../shared/components/validation-message.component';

@Component({
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, ValidationMessageComponent],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Inventory</p>
        <h1>Materials and suppliers</h1>
        <p class="muted">Manage supplier records, material stock levels and project allocations.</p>
      </div>

      <form class="work-card" [formGroup]="supplierForm" (ngSubmit)="createSupplier()" novalidate>
        <div class="form-grid">
          <div><label for="supplierName">Supplier name</label><input id="supplierName" formControlName="name"><app-validation-message [control]="supplierForm.controls.name" label="Supplier name" /></div>
          <div><label for="contactName">Contact</label><input id="contactName" formControlName="contactName"></div>
          <div><label for="supplierEmail">Email</label><input id="supplierEmail" formControlName="email"></div>
          <div><label for="supplierPhone">Phone</label><input id="supplierPhone" formControlName="phoneNumber"></div>
        </div>
        <button class="primary-button" type="submit">Add supplier</button>
      </form>

      <form class="work-card" [formGroup]="materialForm" (ngSubmit)="createMaterial()" novalidate>
        <div class="form-grid">
          <div><label for="code">Code</label><input id="code" formControlName="code"><app-validation-message [control]="materialForm.controls.code" label="Code" /></div>
          <div><label for="name">Name</label><input id="name" formControlName="name"><app-validation-message [control]="materialForm.controls.name" label="Name" /></div>
          <div><label for="unit">Unit</label><select id="unit" formControlName="unitOfMeasure">@for (unit of units; track unit) { <option [value]="unit">{{ unit }}</option> }</select></div>
          <div><label for="unitCost">Unit cost</label><input id="unitCost" type="number" min="0" step="0.01" formControlName="unitCost"></div>
          <div><label for="reorderLevel">Reorder level</label><input id="reorderLevel" type="number" min="0" step="0.001" formControlName="reorderLevel"></div>
          <div><label for="supplierId">Supplier</label><select id="supplierId" formControlName="supplierId"><option value="">None</option>@for (supplier of suppliers(); track supplier.id) { <option [value]="supplier.id">{{ supplier.name }}</option> }</select></div>
        </div>
        <button class="primary-button" type="submit">Add material</button>
      </form>

      <form class="work-card" [formGroup]="stockForm" (ngSubmit)="changeStock()" novalidate>
        <div class="form-grid">
          <div><label for="materialId">Material</label><select id="materialId" formControlName="materialId"><option value="">Select material</option>@for (material of materials(); track material.id) { <option [value]="material.id">{{ material.code }} - {{ material.name }}</option> }</select></div>
          <div><label for="type">Movement</label><select id="type" formControlName="type">@for (type of transactionTypes; track type) { <option [value]="type">{{ type }}</option> }</select></div>
          <div><label for="quantity">Quantity</label><input id="quantity" type="number" min="0.001" step="0.001" formControlName="quantity"></div>
          <div><label for="projectId">Project</label><select id="projectId" formControlName="projectId"><option value="">None</option>@for (project of projects(); track project.id) { <option [value]="project.id">{{ project.projectNumber }}</option> }</select></div>
          <div class="full"><label for="notes">Notes</label><input id="notes" formControlName="notes"></div>
        </div>
        <button class="primary-button" type="submit">Record stock movement</button>
      </form>

      <div class="list-stack">
        @for (material of materials(); track material.id) {
          <article class="work-card request-card">
            <div>
              <strong>{{ material.code }} · {{ material.name }}</strong>
              <p>{{ material.stockQuantity | number:'1.3-3' }} {{ material.unitOfMeasure }} · Unit cost {{ material.unitCost | number:'1.2-2' }}</p>
              <span class="muted">{{ material.supplierName || 'No supplier' }}</span>
            </div>
            <span class="status-pill">{{ material.lowStock ? 'LOW STOCK' : 'OK' }}</span>
          </article>
        } @empty {
          <div class="empty-state"><strong>No materials yet</strong><span>Add your first material above.</span></div>
        }
      </div>

      <div class="list-stack">
        <h2 class="section-title">Stock history</h2>
        @for (transaction of transactions(); track transaction.id) {
          <article class="work-card request-card">
            <div>
              <strong>{{ transaction.materialCode }} · {{ transaction.type }}</strong>
              <p>{{ transaction.quantity | number:'1.3-3' }} · {{ transaction.createdAt | date:'medium' }}</p>
              <span class="muted">{{ transaction.notes }}</span>
            </div>
            @if (transaction.projectId) { <span class="status-pill">PROJECT</span> }
          </article>
        } @empty {
          <div class="empty-state"><strong>No stock movements yet</strong><span>Transactions appear after stock changes.</span></div>
        }
      </div>
    </section>
  `
})
export class InventoryComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventory = inject(InventoryApiService);
  private readonly projectsApi = inject(ProjectApiService);
  private readonly notifications = inject(NotificationService);
  readonly suppliers = signal<Supplier[]>([]);
  readonly materials = signal<Material[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly transactions = signal<StockTransaction[]>([]);
  readonly units: UnitOfMeasure[] = ['EACH', 'METRE', 'SQUARE_METRE', 'LITRE', 'KILOGRAM', 'PACK', 'SHEET'];
  readonly transactionTypes: StockTransactionType[] = ['STOCK_IN', 'PROJECT_ALLOCATION', 'PROJECT_RETURN', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'DAMAGED'];
  readonly supplierForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(140)]],
    contactName: [''],
    email: [''],
    phoneNumber: [''],
    active: [true]
  });
  readonly materialForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(40)]],
    name: ['', [Validators.required, Validators.maxLength(160)]],
    unitOfMeasure: ['EACH' as UnitOfMeasure, Validators.required],
    unitCost: [0, [Validators.required, Validators.min(0)]],
    reorderLevel: [0, [Validators.required, Validators.min(0)]],
    supplierId: [''],
    active: [true]
  });
  readonly stockForm = this.fb.nonNullable.group({
    materialId: ['', Validators.required],
    type: ['STOCK_IN' as StockTransactionType, Validators.required],
    quantity: [1, [Validators.required, Validators.min(0.001)]],
    projectId: [''],
    notes: ['']
  });

  ngOnInit(): void { this.load(); }

  createSupplier(): void {
    if (this.supplierForm.invalid) { this.supplierForm.markAllAsTouched(); return; }
    this.inventory.createSupplier(this.supplierForm.getRawValue()).subscribe(supplier => {
      this.suppliers.update(items => [supplier, ...items]);
      this.supplierForm.reset({ name: '', contactName: '', email: '', phoneNumber: '', active: true });
      this.notifications.success('Supplier added.');
    });
  }

  createMaterial(): void {
    if (this.materialForm.invalid) { this.materialForm.markAllAsTouched(); return; }
    const value = this.materialForm.getRawValue();
    this.inventory.createMaterial({ ...value, supplierId: value.supplierId || null }).subscribe(material => {
      this.materials.update(items => [material, ...items]);
      this.materialForm.reset({ code: '', name: '', unitOfMeasure: 'EACH', unitCost: 0, reorderLevel: 0, supplierId: '', active: true });
      this.notifications.success('Material added.');
    });
  }

  changeStock(): void {
    if (this.stockForm.invalid) { this.stockForm.markAllAsTouched(); return; }
    const value = this.stockForm.getRawValue();
    this.inventory.changeStock({ ...value, projectId: value.projectId || null }).subscribe(transaction => {
      this.transactions.update(items => [transaction, ...items]);
      this.stockForm.patchValue({ quantity: 1, notes: '' });
      this.loadMaterials();
      this.notifications.success('Stock movement recorded.');
    });
  }

  private load(): void {
    this.inventory.suppliers().subscribe(page => this.suppliers.set(page.content));
    this.loadMaterials();
    this.inventory.transactions().subscribe(page => this.transactions.set(page.content));
    this.projectsApi.all().subscribe(page => this.projects.set(page.content));
  }

  private loadMaterials(): void {
    this.inventory.materials().subscribe(page => this.materials.set(page.content));
  }
}
