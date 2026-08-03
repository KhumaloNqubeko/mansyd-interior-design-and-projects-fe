import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Quotation, QuotationItemType } from '../../core/models/quotation.models';
import { ServiceRequest } from '../../core/models/service-request.models';
import { NotificationService } from '../../core/services/notification.service';
import { QuotationApiService } from '../../core/services/quotation-api.service';
import { ServiceRequestApiService } from '../../core/services/service-request-api.service';
import { ValidationMessageComponent } from '../../shared/components/validation-message.component';

@Component({
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, ValidationMessageComponent],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Quotations</p>
        <h1>Build quotations</h1>
        <p class="muted">Create draft quotations from service requests, add priced items, then submit them to customers.</p>
      </div>

      <form class="work-card" [formGroup]="quoteForm" (ngSubmit)="createQuotation()" novalidate>
        <div class="form-grid">
          <div>
            <label for="serviceRequestId">Service request</label>
            <select id="serviceRequestId" formControlName="serviceRequestId">
              <option value="">Select request</option>
              @for (request of requests(); track request.id) { <option [value]="request.id">{{ request.title }} - {{ request.customerName }}</option> }
            </select>
            <app-validation-message [control]="quoteForm.controls.serviceRequestId" label="Service request" />
          </div>
          <div><label for="expiryDate">Expiry date</label><input id="expiryDate" type="date" formControlName="expiryDate"><app-validation-message [control]="quoteForm.controls.expiryDate" label="Expiry date" /></div>
          <div class="full"><label for="notes">Notes</label><textarea id="notes" formControlName="notes"></textarea></div>
        </div>
        <button class="primary-button" type="submit" [disabled]="saving()">{{ saving() ? 'Creating...' : 'Create quotation' }}</button>
      </form>

      <div class="list-stack">
        @for (quote of quotations(); track quote.id) {
          <article class="work-card quote-card">
            <div class="quote-head">
              <div>
                <strong>{{ quote.quotationNumber }}</strong>
                <p>{{ quote.customerName }} · Expires {{ quote.expiryDate | date:'mediumDate' }}</p>
              </div>
              <span class="status-pill">{{ quote.status }}</span>
            </div>

            <div class="money-grid">
              <span>Subtotal <strong>{{ quote.subtotal | number:'1.2-2' }}</strong></span>
              <span>Discount <strong>{{ quote.discountTotal | number:'1.2-2' }}</strong></span>
              <span>Tax <strong>{{ quote.taxTotal | number:'1.2-2' }}</strong></span>
              <span>Total <strong>{{ quote.total | number:'1.2-2' }}</strong></span>
            </div>

            @if (quote.status === 'DRAFT') {
              <form class="inline-form" [formGroup]="itemForm" (ngSubmit)="addItem(quote)" novalidate>
                <select formControlName="type">@for (type of itemTypes; track type) { <option [value]="type">{{ type }}</option> }</select>
                <input formControlName="description" placeholder="Item description">
                <input type="number" min="0.001" step="0.001" formControlName="quantity" placeholder="Qty">
                <input type="number" min="0" step="0.01" formControlName="unitPrice" placeholder="Unit price">
                <input type="number" min="0" step="0.01" formControlName="discountAmount" placeholder="Discount">
                <input type="number" min="0" step="0.01" formControlName="taxRate" placeholder="Tax %">
                <button type="submit" class="text-button dark">Add item</button>
              </form>
              <button type="button" class="primary-button compact" (click)="submitQuote(quote)">Submit to customer</button>
            }

            <div class="item-list">
              @for (item of quote.items; track item.id) {
                <span>{{ item.type }} · {{ item.description }} · {{ item.quantity }} × {{ item.unitPrice | number:'1.2-2' }} = {{ item.lineTotal | number:'1.2-2' }}</span>
              } @empty {
                <span class="muted">No quotation items yet.</span>
              }
            </div>
          </article>
        } @empty {
          <div class="empty-state"><strong>No quotations yet</strong><span>Create one from a service request above.</span></div>
        }
      </div>
    </section>
  `
})
export class CarpenterQuotationsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly quotationsApi = inject(QuotationApiService);
  private readonly requestsApi = inject(ServiceRequestApiService);
  private readonly notifications = inject(NotificationService);
  readonly quotations = signal<Quotation[]>([]);
  readonly requests = signal<ServiceRequest[]>([]);
  readonly saving = signal(false);
  readonly itemTypes: QuotationItemType[] = ['MATERIAL', 'LABOUR', 'DELIVERY', 'OTHER'];
  readonly quoteForm = this.fb.nonNullable.group({
    serviceRequestId: ['', Validators.required],
    expiryDate: ['', Validators.required],
    notes: ['']
  });
  readonly itemForm = this.fb.nonNullable.group({
    type: ['MATERIAL' as QuotationItemType, Validators.required],
    description: ['', [Validators.required, Validators.maxLength(180)]],
    quantity: [1, [Validators.required, Validators.min(0.001)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]],
    discountAmount: [0, [Validators.required, Validators.min(0)]],
    taxRate: [15, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void { this.load(); }

  createQuotation(): void {
    if (this.quoteForm.invalid) { this.quoteForm.markAllAsTouched(); return; }
    this.saving.set(true);
    this.quotationsApi.create(this.quoteForm.getRawValue()).pipe(finalize(() => this.saving.set(false))).subscribe(() => {
      this.notifications.success('Quotation draft created.');
      this.quoteForm.reset();
      this.load();
    });
  }

  addItem(quote: Quotation): void {
    if (this.itemForm.invalid) { this.itemForm.markAllAsTouched(); return; }
    this.quotationsApi.addItem(quote.id, this.itemForm.getRawValue()).subscribe(updated => {
      this.replace(updated);
      this.notifications.success('Quotation item added.');
    });
  }

  submitQuote(quote: Quotation): void {
    this.quotationsApi.submit(quote.id).subscribe(updated => {
      this.replace(updated);
      this.notifications.success('Quotation submitted.');
    });
  }

  private load(): void {
    this.quotationsApi.all().subscribe(page => this.quotations.set(page.content));
    this.requestsApi.all().subscribe(page => this.requests.set(page.content.filter(request => request.status !== 'CANCELLED' && request.status !== 'CLOSED')));
  }

  private replace(updated: Quotation): void {
    this.quotations.update(items => items.map(item => item.id === updated.id ? updated : item));
  }
}
