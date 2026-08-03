import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Expense, ExpenseCategory } from '../../core/models/expense.models';
import { Material, Supplier } from '../../core/models/inventory.models';
import { Project } from '../../core/models/project.models';
import { ExpenseApiService } from '../../core/services/expense-api.service';
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
        <p class="eyebrow">Expenses</p>
        <h1>Business costs</h1>
        <p class="muted">Capture project, supplier and material costs so reporting has a proper source of truth.</p>
      </div>

      <form class="work-card" [formGroup]="expenseForm" (ngSubmit)="saveExpense()" novalidate>
        <div class="form-grid">
          <div>
            <label for="title">Title</label>
            <input id="title" formControlName="title">
            <app-validation-message [control]="expenseForm.controls.title" label="Title" />
          </div>
          <div>
            <label for="category">Category</label>
            <select id="category" formControlName="category">
              @for (category of categories; track category) { <option [value]="category">{{ category }}</option> }
            </select>
          </div>
          <div>
            <label for="amount">Amount</label>
            <input id="amount" type="number" min="0.01" step="0.01" formControlName="amount">
            <app-validation-message [control]="expenseForm.controls.amount" label="Amount" />
          </div>
          <div>
            <label for="expenseDate">Expense date</label>
            <input id="expenseDate" type="date" formControlName="expenseDate">
          </div>
          <div>
            <label for="supplierId">Supplier</label>
            <select id="supplierId" formControlName="supplierId">
              <option value="">None</option>
              @for (supplier of suppliers(); track supplier.id) { <option [value]="supplier.id">{{ supplier.name }}</option> }
            </select>
          </div>
          <div>
            <label for="projectId">Project</label>
            <select id="projectId" formControlName="projectId">
              <option value="">None</option>
              @for (project of projects(); track project.id) { <option [value]="project.id">{{ project.projectNumber }}</option> }
            </select>
          </div>
          <div>
            <label for="materialId">Material</label>
            <select id="materialId" formControlName="materialId">
              <option value="">None</option>
              @for (material of materials(); track material.id) { <option [value]="material.id">{{ material.code }} - {{ material.name }}</option> }
            </select>
          </div>
          <div>
            <label for="receiptReference">Receipt/reference</label>
            <input id="receiptReference" formControlName="receiptReference">
          </div>
          <div class="full">
            <label for="notes">Notes</label>
            <textarea id="notes" formControlName="notes"></textarea>
          </div>
        </div>
        <button class="primary-button" type="submit">{{ editingId() ? 'Update expense' : 'Add expense' }}</button>
        @if (editingId()) {
          <button class="primary-button compact muted-button" type="button" (click)="cancelEdit()">Cancel edit</button>
        }
      </form>

      <div class="list-stack">
        @for (expense of expenses(); track expense.id) {
          <article class="work-card request-card">
            <div>
              <strong>{{ expense.title }}</strong>
              <p>{{ expense.category }} · {{ expense.amount | number:'1.2-2' }} · {{ expense.expenseDate | date:'mediumDate' }}</p>
              <span class="muted">
                {{ expense.supplierName || 'No supplier' }}
                @if (expense.projectNumber) { · Project {{ expense.projectNumber }} }
                @if (expense.materialCode) { · Material {{ expense.materialCode }} }
              </span>
              @if (expense.receiptReference) { <p class="muted">Ref: {{ expense.receiptReference }}</p> }
            </div>
            <div class="status-actions">
              <span class="status-pill">{{ expense.status }}</span>
              @if (expense.status === 'DRAFT') {
                <button class="text-button dark" type="button" (click)="edit(expense)">Edit</button>
                <button class="text-button dark" type="button" (click)="approve(expense)">Approve</button>
                <button class="text-button dark" type="button" (click)="void(expense)">Void</button>
              }
              @if (expense.status === 'APPROVED') {
                <button class="text-button dark" type="button" (click)="reimburse(expense)">Mark reimbursed</button>
                <button class="text-button dark" type="button" (click)="void(expense)">Void</button>
              }
            </div>
          </article>
        } @empty {
          <div class="empty-state"><strong>No expenses yet</strong><span>Capture the first business cost above.</span></div>
        }
      </div>
    </section>
  `
})
export class ExpenseListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly expensesApi = inject(ExpenseApiService);
  private readonly inventory = inject(InventoryApiService);
  private readonly projectsApi = inject(ProjectApiService);
  private readonly notifications = inject(NotificationService);
  readonly expenses = signal<Expense[]>([]);
  readonly suppliers = signal<Supplier[]>([]);
  readonly materials = signal<Material[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly editingId = signal<string | null>(null);
  readonly categories: ExpenseCategory[] = ['MATERIALS', 'LABOUR', 'TRANSPORT', 'EQUIPMENT', 'SUBCONTRACTOR', 'OVERHEAD', 'OTHER'];
  readonly expenseForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    category: ['MATERIALS' as ExpenseCategory, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    expenseDate: [new Date().toISOString().slice(0, 10), Validators.required],
    receiptReference: [''],
    notes: [''],
    supplierId: [''],
    projectId: [''],
    materialId: ['']
  });

  ngOnInit(): void { this.load(); }

  saveExpense(): void {
    if (this.expenseForm.invalid) { this.expenseForm.markAllAsTouched(); return; }
    const raw = this.expenseForm.getRawValue();
    const request = {
      ...raw,
      supplierId: raw.supplierId || null,
      projectId: raw.projectId || null,
      materialId: raw.materialId || null
    };
    const id = this.editingId();
    const action = id ? this.expensesApi.update(id, request) : this.expensesApi.create(request);
    action.subscribe(expense => {
      this.upsert(expense);
      this.resetForm();
      this.notifications.success(id ? 'Expense updated.' : 'Expense captured.');
    });
  }

  edit(expense: Expense): void {
    this.editingId.set(expense.id);
    this.expenseForm.reset({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      expenseDate: expense.expenseDate,
      receiptReference: expense.receiptReference,
      notes: expense.notes,
      supplierId: expense.supplierId ?? '',
      projectId: expense.projectId ?? '',
      materialId: expense.materialId ?? ''
    });
  }

  cancelEdit(): void { this.resetForm(); }
  approve(expense: Expense): void { this.transition(this.expensesApi.approve(expense.id), 'Expense approved.'); }
  reimburse(expense: Expense): void { this.transition(this.expensesApi.reimburse(expense.id), 'Expense reimbursed.'); }
  void(expense: Expense): void { this.transition(this.expensesApi.void(expense.id), 'Expense voided.'); }

  private load(): void {
    this.expensesApi.expenses().subscribe(page => this.expenses.set(page.content));
    this.inventory.suppliers().subscribe(page => this.suppliers.set(page.content));
    this.inventory.materials().subscribe(page => this.materials.set(page.content));
    this.projectsApi.all().subscribe(page => this.projects.set(page.content));
  }

  private transition(source: ReturnType<ExpenseApiService['approve']>, message: string): void {
    source.subscribe(expense => {
      this.upsert(expense);
      this.notifications.success(message);
    });
  }

  private upsert(expense: Expense): void {
    this.expenses.update(items => [expense, ...items.filter(item => item.id !== expense.id)]);
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.expenseForm.reset({
      title: '',
      category: 'MATERIALS',
      amount: 0,
      expenseDate: new Date().toISOString().slice(0, 10),
      receiptReference: '',
      notes: '',
      supplierId: '',
      projectId: '',
      materialId: ''
    });
  }
}
