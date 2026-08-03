import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Invoice } from '../../core/models/invoice.models';
import { Order } from '../../core/models/order.models';
import { Payment } from '../../core/models/payment.models';
import { InvoiceApiService } from '../../core/services/invoice-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { OrderApiService } from '../../core/services/order-api.service';
import { PaymentApiService } from '../../core/services/payment-api.service';
import { ValidationMessageComponent } from '../../shared/components/validation-message.component';

@Component({
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, ValidationMessageComponent],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Billing</p>
        <h1>{{ carpenterMode() ? 'Invoices and payments' : 'My invoices and payments' }}</h1>
        <p class="muted">Invoices are issued by the carpenter; customer payments wait for review before balances update.</p>
      </div>

      @if (carpenterMode()) {
        <form class="work-card" [formGroup]="invoiceForm" (ngSubmit)="createInvoice()" novalidate>
          <div class="form-grid">
            <div>
              <label for="orderId">Order</label>
              <select id="orderId" formControlName="orderId">
                <option value="">Select order</option>
                @for (order of orders(); track order.id) { <option [value]="order.id">{{ order.orderNumber }} - {{ order.customerName }}</option> }
              </select>
              <app-validation-message [control]="invoiceForm.controls.orderId" label="Order" />
            </div>
            <div><label for="dueDate">Due date</label><input id="dueDate" type="date" formControlName="dueDate"><app-validation-message [control]="invoiceForm.controls.dueDate" label="Due date" /></div>
            <div><label for="totalAmount">Total amount</label><input id="totalAmount" type="number" min="0.01" step="0.01" formControlName="totalAmount"><app-validation-message [control]="invoiceForm.controls.totalAmount" label="Total amount" /></div>
            <div class="full"><label for="notes">Notes</label><input id="notes" formControlName="notes"></div>
          </div>
          <button class="primary-button" type="submit">Create invoice</button>
        </form>
      }

      <div class="list-stack">
        @for (invoice of invoices(); track invoice.id) {
          <article class="work-card quote-card">
            <div class="quote-head">
              <div>
                <strong>{{ invoice.invoiceNumber }}</strong>
                <p>{{ invoice.orderNumber }} · {{ invoice.customerName }} · Due {{ invoice.dueDate | date:'mediumDate' }}</p>
              </div>
              <span class="status-pill">{{ invoice.status }}</span>
            </div>
            <div class="money-grid">
              <span>Total <strong>{{ invoice.totalAmount | number:'1.2-2' }}</strong></span>
              <span>Paid <strong>{{ invoice.paidAmount | number:'1.2-2' }}</strong></span>
              <span>Balance <strong>{{ invoice.balanceDue | number:'1.2-2' }}</strong></span>
              <span>Issued <strong>{{ invoice.issueDate || 'Not issued' }}</strong></span>
            </div>
            @if (carpenterMode() && invoice.status === 'DRAFT') {
              <button type="button" class="primary-button compact" (click)="issue(invoice)">Issue invoice</button>
            }
            @if (!carpenterMode() && invoice.balanceDue > 0 && invoice.status !== 'DRAFT' && invoice.status !== 'CANCELLED') {
              <form class="inline-form payment-inline" [formGroup]="paymentForm" (ngSubmit)="submitPayment(invoice)" novalidate>
                <input type="number" min="0.01" step="0.01" formControlName="amount" placeholder="Amount">
                <input type="date" formControlName="paymentDate">
                <input formControlName="proofReference" placeholder="Proof/reference">
                <input formControlName="notes" placeholder="Notes">
                <button type="submit" class="text-button dark">Submit payment</button>
              </form>
            }
          </article>
        } @empty {
          <div class="empty-state"><strong>No invoices yet</strong><span>Invoices will appear here after they are created.</span></div>
        }
      </div>

      <div class="list-stack">
        <h2 class="section-title">Payments</h2>
        @for (payment of payments(); track payment.id) {
          <article class="work-card request-card">
            <div>
              <strong>{{ payment.invoiceNumber }}</strong>
              <p>{{ payment.customerName }} · {{ payment.amount | number:'1.2-2' }} · {{ payment.paymentDate | date:'mediumDate' }}</p>
              <span class="muted">{{ payment.proofReference }}</span>
            </div>
            <div class="status-actions">
              <span class="status-pill">{{ payment.status }}</span>
              @if (carpenterMode() && payment.status === 'PENDING_REVIEW') {
                <button type="button" class="text-button dark" (click)="approve(payment)">Approve</button>
                <button type="button" class="text-button dark" (click)="reject(payment)">Reject</button>
              }
            </div>
          </article>
        } @empty {
          <div class="empty-state"><strong>No payments yet</strong><span>Submitted payment references will appear here.</span></div>
        }
      </div>
    </section>
  `
})
export class BillingComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly invoicesApi = inject(InvoiceApiService);
  private readonly paymentsApi = inject(PaymentApiService);
  private readonly ordersApi = inject(OrderApiService);
  private readonly notifications = inject(NotificationService);
  readonly carpenterMode = signal(false);
  readonly invoices = signal<Invoice[]>([]);
  readonly payments = signal<Payment[]>([]);
  readonly orders = signal<Order[]>([]);
  readonly invoiceForm = this.fb.nonNullable.group({
    orderId: ['', Validators.required],
    dueDate: ['', Validators.required],
    totalAmount: [0, [Validators.required, Validators.min(0.01)]],
    notes: ['']
  });
  readonly paymentForm = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    paymentDate: ['', Validators.required],
    proofReference: ['', [Validators.required, Validators.maxLength(180)]],
    notes: ['']
  });

  ngOnInit(): void {
    this.carpenterMode.set(this.route.snapshot.data['scope'] === 'carpenter');
    this.load();
  }

  createInvoice(): void {
    if (this.invoiceForm.invalid) { this.invoiceForm.markAllAsTouched(); return; }
    this.invoicesApi.create(this.invoiceForm.getRawValue()).subscribe(invoice => {
      this.invoices.update(items => [invoice, ...items]);
      this.invoiceForm.reset();
      this.notifications.success('Invoice created.');
    });
  }

  issue(invoice: Invoice): void {
    this.invoicesApi.issue(invoice.id).subscribe(updated => {
      this.replaceInvoice(updated);
      this.notifications.success('Invoice issued.');
    });
  }

  submitPayment(invoice: Invoice): void {
    if (this.paymentForm.invalid) { this.paymentForm.markAllAsTouched(); return; }
    this.paymentsApi.submit({ ...this.paymentForm.getRawValue(), invoiceId: invoice.id }).subscribe(payment => {
      this.payments.update(items => [payment, ...items]);
      this.paymentForm.reset();
      this.notifications.success('Payment submitted for review.');
    });
  }

  approve(payment: Payment): void {
    this.paymentsApi.approve(payment.id).subscribe(updated => {
      this.replacePayment(updated);
      this.loadInvoices();
      this.notifications.success('Payment approved.');
    });
  }

  reject(payment: Payment): void {
    this.paymentsApi.reject(payment.id, 'Rejected by carpenter').subscribe(updated => {
      this.replacePayment(updated);
      this.notifications.success('Payment rejected.');
    });
  }

  private load(): void {
    this.loadInvoices();
    const payments = this.carpenterMode() ? this.paymentsApi.all() : this.paymentsApi.my();
    payments.subscribe(page => this.payments.set(page.content));
    if (this.carpenterMode()) this.ordersApi.all().subscribe(page => this.orders.set(page.content));
  }

  private loadInvoices(): void {
    const invoices = this.carpenterMode() ? this.invoicesApi.all() : this.invoicesApi.my();
    invoices.subscribe(page => this.invoices.set(page.content));
  }

  private replaceInvoice(updated: Invoice): void {
    this.invoices.update(items => items.map(item => item.id === updated.id ? updated : item));
  }

  private replacePayment(updated: Payment): void {
    this.payments.update(items => items.map(item => item.id === updated.id ? updated : item));
  }
}
