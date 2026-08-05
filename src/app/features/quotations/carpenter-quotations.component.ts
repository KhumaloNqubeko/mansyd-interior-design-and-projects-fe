import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { Quotation } from '../../core/models/quotation.models';
import { ServiceRequest } from '../../core/models/service-request.models';
import { NotificationService } from '../../core/services/notification.service';
import { QuotationApiService } from '../../core/services/quotation-api.service';
import { ServiceRequestApiService } from '../../core/services/service-request-api.service';
import { ValidationMessageComponent } from '../../shared/components/validation-message.component';
import { QuotationDetailDialogComponent } from './quotation-detail-dialog.component';

@Component({
  standalone: true,
  imports: [DatePipe, MatDialogModule, ReactiveFormsModule, ValidationMessageComponent],
  template: `
    <section class="panel-page quotes-page">
      <div class="page-heading">
        <p class="eyebrow">Quotations</p>
        <h1>Build quotations</h1>
        <p class="muted">Create draft quotations from service requests, add priced items, then submit them to customers.</p>
      </div>

      <div class="quotes-layout">
        <form class="work-card quote-form-card" [formGroup]="quoteForm" (ngSubmit)="createQuotation()" novalidate>
          <div class="section-kicker">
            <span>New quotation</span>
            <strong>Start from a service request</strong>
          </div>
          <div class="form-grid">
            <div>
              <label for="serviceRequestId">Service request</label>
              <select id="serviceRequestId" formControlName="serviceRequestId">
                <option value="">Select request</option>
                @for (request of requests(); track request.id) { <option [value]="request.id">{{ request.title }} - {{ request.customerName }}</option> }
              </select>
              <app-validation-message [control]="quoteForm.controls.serviceRequestId" label="Service request" />
            </div>
            <div>
              <label for="expiryDate">Expiry date</label>
              <input id="expiryDate" type="date" formControlName="expiryDate">
              <app-validation-message [control]="quoteForm.controls.expiryDate" label="Expiry date" />
            </div>
            <div class="full">
              <label for="notes">Notes</label>
              <textarea id="notes" formControlName="notes" placeholder="Payment terms, exclusions, timelines, or customer-facing notes."></textarea>
            </div>
          </div>
          <button class="primary-button" type="submit" [disabled]="saving()">{{ saving() ? 'Creating...' : 'Create quotation' }}</button>
        </form>

        <aside class="quote-history" aria-label="Existing quotations">
          <div class="history-heading">
            <div>
              <p class="eyebrow">Existing</p>
              <h2>Quotation workspace</h2>
            </div>
            <span class="status-pill">{{ quotations().length }}</span>
          </div>

          <div class="list-stack compact-list">
            @for (quote of quotations(); track quote.id) {
              <article class="work-card quote-list-card">
                <div>
                  <strong>{{ quote.quotationNumber }}</strong>
                  <p>{{ quote.customerName }}</p>
                  <span class="muted">Expires {{ quote.expiryDate | date:'mediumDate' }}</span>
                </div>
                <span class="status-pill">{{ quote.status }}</span>
                <button type="button" class="text-button dark" (click)="openQuote(quote)">
                  {{ quote.status === 'DRAFT' ? 'View / edit' : 'View' }}
                </button>
              </article>
            } @empty {
              <div class="empty-state compact-empty"><strong>No quotations yet</strong><span>Create one from a service request on the left.</span></div>
            }
          </div>
        </aside>
      </div>
    </section>
  `
})
export class CarpenterQuotationsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly quotationsApi = inject(QuotationApiService);
  private readonly requestsApi = inject(ServiceRequestApiService);
  private readonly notifications = inject(NotificationService);
  readonly quotations = signal<Quotation[]>([]);
  readonly requests = signal<ServiceRequest[]>([]);
  readonly saving = signal(false);
  readonly quoteForm = this.fb.nonNullable.group({
    serviceRequestId: ['', Validators.required],
    expiryDate: ['', Validators.required],
    notes: ['']
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

  openQuote(quote: Quotation): void {
    const ref = this.dialog.open(QuotationDetailDialogComponent, {
      width: '98vw',
      maxWidth: '1600px',
      maxHeight: '92vh',
      panelClass: 'quote-dialog-panel',
      data: { quote }
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      if (result.action === 'deleted') {
        this.quotations.update(items => items.filter(item => item.id !== result.id));
        this.load();
      } else {
        this.replace(result.quote);
      }
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
