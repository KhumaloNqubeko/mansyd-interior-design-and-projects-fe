import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Quotation, QuotationItem, QuotationItemType } from '../../core/models/quotation.models';
import { NotificationService } from '../../core/services/notification.service';
import { QuotationApiService } from '../../core/services/quotation-api.service';

interface QuotationDialogData {
  quote: Quotation;
}

type DialogResult = { action: 'updated'; quote: Quotation } | { action: 'deleted'; id: string };

@Component({
  standalone: true,
  imports: [DatePipe, DecimalPipe, MatDialogModule, ReactiveFormsModule],
  template: `
    <section class="quote-dialog">
      <header class="quote-dialog-head">
        <div>
          <p class="eyebrow">Quotation</p>
          <h2>{{ quote().quotationNumber }}</h2>
          <p class="muted">{{ quote().customerName }} · Expires {{ quote().expiryDate | date:'mediumDate' }}</p>
        </div>
        <span class="status-pill">{{ quote().status }}</span>
      </header>

      @if (quote().notes) {
        <div class="dialog-note">
          <strong>Notes</strong>
          <p>{{ quote().notes }}</p>
        </div>
      }

      @if (quote().rejectionNotes) {
        <div class="dialog-note rejection-note">
          <strong>Latest customer rejection notes</strong>
          <p>{{ quote().rejectionNotes }}</p>
        </div>
      }

      @if (editingQuote()) {
        <form class="inline-form quote-edit-form dialog-form" [formGroup]="quoteEditForm" (ngSubmit)="saveQuote()" novalidate>
          <input type="date" formControlName="expiryDate" aria-label="Expiry date">
          <input formControlName="notes" placeholder="Notes">
          <button type="submit" class="text-button dark">Save quote</button>
          <button type="button" class="text-button dark" (click)="cancelQuoteEdit()">Cancel</button>
        </form>
      }

      <div class="money-grid">
        <span>Subtotal <strong>{{ quote().subtotal | number:'1.2-2' }}</strong></span>
        <span>Discount <strong>{{ quote().discountTotal | number:'1.2-2' }}</strong></span>
        <span>Tax <strong>{{ quote().taxTotal | number:'1.2-2' }}</strong></span>
        <span>Total <strong>{{ quote().total | number:'1.2-2' }}</strong></span>
      </div>

      @if (canEdit()) {
        <form class="quote-item-capture dialog-form" [formGroup]="itemForm" (ngSubmit)="saveItem()" novalidate>
          <div>
            <label for="itemType">Item type</label>
            <select id="itemType" formControlName="type">@for (type of itemTypes; track type) { <option [value]="type">{{ type }}</option> }</select>
          </div>
          <div class="wide">
            <label for="itemDescription">Description</label>
            <input id="itemDescription" formControlName="description" placeholder="e.g. Base cabinet, hinges, installation labour">
          </div>
          <div>
            <label for="itemQuantity">Quantity</label>
            <input id="itemQuantity" type="number" min="0.001" step="0.001" formControlName="quantity" placeholder="1">
          </div>
          <div>
            <label for="itemUnitPrice">Unit price</label>
            <input id="itemUnitPrice" type="number" min="0" step="0.01" formControlName="unitPrice" placeholder="0.00">
          </div>
          <div>
            <label for="itemDiscount">Discount amount</label>
            <input id="itemDiscount" type="number" min="0" step="0.01" formControlName="discountAmount" placeholder="Optional">
          </div>
          <div>
            <label for="itemTaxRate">Tax rate %</label>
            <input id="itemTaxRate" type="number" min="0" step="0.01" formControlName="taxRate" placeholder="15">
          </div>
          <button type="submit" class="primary-button compact">{{ editingItemId() ? 'Update item' : 'Add item' }}</button>
          @if (editingItemId()) {
            <button type="button" class="text-button dark" (click)="cancelItemEdit()">Cancel</button>
          }
        </form>
      }

      <div class="item-list dialog-items">
        @for (item of quote().items; track item.id) {
          <span class="item-row">
            <span>{{ item.type }} · {{ item.description }} · {{ item.quantity }} × {{ item.unitPrice | number:'1.2-2' }} = {{ item.lineTotal | number:'1.2-2' }}</span>
            @if (canEdit()) {
              <span class="button-row compact-row">
                <button type="button" class="text-button dark" (click)="editItem(item)">Edit</button>
                <button type="button" class="text-button dark" (click)="deleteItem(item)">Remove</button>
              </span>
            }
          </span>
        } @empty {
          <span class="muted">No quotation items yet.</span>
        }
      </div>

      <footer class="dialog-actions">
        @if (canEdit()) {
          <button type="button" class="text-button dark" (click)="editQuote()">Edit quote</button>
          @if (quote().status === 'DRAFT') {
            <button type="button" class="text-button dark" (click)="deleteQuote()">Delete quote</button>
          }
          <button type="button" class="primary-button compact" (click)="submitQuote()">Submit to customer</button>
        }
        <button type="button" class="text-button dark" (click)="close()">Close</button>
      </footer>
    </section>
  `
})
export class QuotationDetailDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly quotationsApi = inject(QuotationApiService);
  private readonly notifications = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<QuotationDetailDialogComponent, DialogResult | undefined>);
  readonly quote = signal(this.data.quote);
  readonly editingQuote = signal(false);
  readonly editingItemId = signal<string | null>(null);
  readonly itemTypes: QuotationItemType[] = ['MATERIAL', 'LABOUR', 'DELIVERY', 'OTHER'];
  readonly quoteEditForm = this.fb.nonNullable.group({
    expiryDate: [this.data.quote.expiryDate, Validators.required],
    notes: [this.data.quote.notes]
  });
  readonly itemForm = this.fb.nonNullable.group({
    type: ['MATERIAL' as QuotationItemType, Validators.required],
    description: ['', [Validators.required, Validators.maxLength(180)]],
    quantity: [1, [Validators.required, Validators.min(0.001)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
    discountAmount: [0, [Validators.required, Validators.min(0)]],
    taxRate: [15, [Validators.required, Validators.min(0)]]
  });

  constructor(@Inject(MAT_DIALOG_DATA) private readonly data: QuotationDialogData) {}

  canEdit(): boolean {
    return this.quote().status === 'DRAFT' || this.quote().status === 'REJECTED';
  }

  editQuote(): void {
    if (this.quote().status !== 'DRAFT') return;
    this.editingQuote.set(true);
    this.quoteEditForm.reset({ expiryDate: this.quote().expiryDate, notes: this.quote().notes });
  }

  saveQuote(): void {
    if (this.quoteEditForm.invalid) { this.quoteEditForm.markAllAsTouched(); return; }
    this.quotationsApi.update(this.quote().id, this.quoteEditForm.getRawValue()).subscribe(updated => {
      this.quote.set(updated);
      this.editingQuote.set(false);
      this.notifications.success('Quotation updated.');
    });
  }

  cancelQuoteEdit(): void {
    this.editingQuote.set(false);
    this.quoteEditForm.reset({ expiryDate: this.quote().expiryDate, notes: this.quote().notes });
  }

  saveItem(): void {
    if (this.itemForm.invalid) { this.itemForm.markAllAsTouched(); return; }
    const itemId = this.editingItemId();
    const action = itemId
      ? this.quotationsApi.updateItem(this.quote().id, itemId, this.itemForm.getRawValue())
      : this.quotationsApi.addItem(this.quote().id, this.itemForm.getRawValue());
    action.subscribe(updated => {
      this.quote.set(updated);
      this.cancelItemEdit();
      this.notifications.success(itemId ? 'Quotation item updated.' : 'Quotation item added.');
    });
  }

  editItem(item: QuotationItem): void {
    this.editingItemId.set(item.id);
    this.itemForm.reset({
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountAmount: item.discountAmount,
      taxRate: item.taxRate
    });
  }

  deleteItem(item: QuotationItem): void {
    this.quotationsApi.deleteItem(this.quote().id, item.id).subscribe(updated => {
      this.quote.set(updated);
      if (this.editingItemId() === item.id) this.cancelItemEdit();
      this.notifications.success('Quotation item removed.');
    });
  }

  cancelItemEdit(): void {
    this.editingItemId.set(null);
    this.itemForm.reset({
      type: 'MATERIAL',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountAmount: 0,
      taxRate: 15
    });
  }

  submitQuote(): void {
    this.quotationsApi.submit(this.quote().id).subscribe(updated => {
      this.quote.set(updated);
      this.cancelItemEdit();
      this.editingQuote.set(false);
      this.notifications.success('Quotation submitted.');
    });
  }

  deleteQuote(): void {
    if (!confirm(`Delete draft quotation ${this.quote().quotationNumber}?`)) return;
    const id = this.quote().id;
    this.quotationsApi.delete(id).subscribe(() => {
      this.notifications.success('Quotation deleted.');
      this.dialogRef.close({ action: 'deleted', id });
    });
  }

  close(): void {
    this.dialogRef.close({ action: 'updated', quote: this.quote() });
  }
}
