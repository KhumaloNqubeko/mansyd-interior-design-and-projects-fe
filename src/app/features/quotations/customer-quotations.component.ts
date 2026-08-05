import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Quotation } from '../../core/models/quotation.models';
import { NotificationService } from '../../core/services/notification.service';
import { QuotationApiService } from '../../core/services/quotation-api.service';

@Component({
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Customer quotations</p>
        <h1>My quotations</h1>
        <p class="muted">Review submitted quotations and accept or reject pending work.</p>
      </div>

      <div class="list-stack">
        @for (quote of quotations(); track quote.id) {
          <article class="work-card quote-card">
            <div class="quote-head">
              <div>
                <strong>{{ quote.quotationNumber }}</strong>
                <p>Expires {{ quote.expiryDate | date:'mediumDate' }}</p>
              </div>
              <span class="status-pill">{{ quote.status }}</span>
            </div>
            <div class="item-list">
              @for (item of quote.items; track item.id) {
                <span>{{ item.description }} · {{ item.lineTotal | number:'1.2-2' }}</span>
              }
            </div>
            @if (quote.rejectionNotes) {
              <div class="dialog-note">
                <strong>Your rejection notes</strong>
                <p>{{ quote.rejectionNotes }}</p>
              </div>
            }
            <div class="money-grid">
              <span>Subtotal <strong>{{ quote.subtotal | number:'1.2-2' }}</strong></span>
              <span>Tax <strong>{{ quote.taxTotal | number:'1.2-2' }}</strong></span>
              <span>Total <strong>{{ quote.total | number:'1.2-2' }}</strong></span>
            </div>
            @if (quote.status === 'PENDING_CUSTOMER') {
              <div class="button-row">
                <button type="button" class="primary-button compact" (click)="accept(quote)">Accept quotation</button>
                <button type="button" class="text-button dark" (click)="reject(quote)">Reject</button>
              </div>
            }
            @if (quote.orderId) { <p class="muted">Order created from this quotation.</p> }
          </article>
        } @empty {
          <div class="empty-state"><strong>No quotations yet</strong><span>Submitted carpenter quotations will appear here.</span></div>
        }
      </div>
    </section>
  `
})
export class CustomerQuotationsComponent implements OnInit {
  private readonly api = inject(QuotationApiService);
  private readonly notifications = inject(NotificationService);
  readonly quotations = signal<Quotation[]>([]);

  ngOnInit(): void { this.load(); }

  accept(quote: Quotation): void {
    this.api.accept(quote.id).subscribe(updated => {
      this.replace(updated);
      this.notifications.success('Quotation accepted and order created.');
    });
  }

  reject(quote: Quotation): void {
    const rejectionNotes = prompt('Please add a short note explaining why you are rejecting this quotation:')?.trim();
    if (rejectionNotes === undefined) return;
    this.api.reject(quote.id, { rejectionNotes }).subscribe(updated => {
      this.replace(updated);
      this.notifications.success('Quotation rejected.');
    });
  }

  private load(): void {
    this.api.my().subscribe(page => this.quotations.set(page.content));
  }

  private replace(updated: Quotation): void {
    this.quotations.update(items => items.map(item => item.id === updated.id ? updated : item));
  }
}
