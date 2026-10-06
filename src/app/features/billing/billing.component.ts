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
        <p class="muted">{{ carpenterMode() ? 'Create and issue an invoice for an accepted order, then review the customer’s payment details against your payment records. Only approved payments reduce the balance.' : 'View what you owe and record payments you have already made. Mansyd reviews each submission before updating your balance.' }}</p>
      </div>

      @if (carpenterMode()) {
        <form class="work-card" [formGroup]="invoiceForm" (ngSubmit)="createInvoice()" novalidate>
          <h2>Create an invoice</h2>
          <p class="muted">Choose the customer’s order and enter the full invoice amount and due date. Each order can have one invoice. Create it as a draft, then issue it to notify the customer that payment is due.</p>
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
            <div><label for="totalAmount">Invoice total (R)</label><input id="totalAmount" type="number" min="0.01" step="0.01" formControlName="totalAmount"><app-validation-message [control]="invoiceForm.controls.totalAmount" label="Total amount" /></div>
            <div class="full"><label for="notes">Notes</label><input id="notes" formControlName="notes"></div>
          </div>
          <button class="primary-button" type="submit">Create draft invoice</button>
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
              <h3>Record a payment for {{ invoice.invoiceNumber }}</h3>
              <p class="muted">After paying using the details agreed with Mansyd, enter the payment below. This form records your payment for review; it does not transfer money. You may submit a partial payment up to the outstanding balance of R {{ invoice.balanceDue | number:'1.2-2' }}.</p>
              <form [formGroup]="paymentForm" (ngSubmit)="submitPayment(invoice)" novalidate>
                <div class="form-grid">
                  <div><label [for]="'amount-' + invoice.id">Amount paid (R)</label><input [id]="'amount-' + invoice.id" type="number" min="0.01" [max]="invoice.balanceDue" step="0.01" formControlName="amount"><app-validation-message [control]="paymentForm.controls.amount" label="Amount paid" /></div>
                  <div><label [for]="'payment-date-' + invoice.id">Date you made the payment</label><input [id]="'payment-date-' + invoice.id" type="date" formControlName="paymentDate"><app-validation-message [control]="paymentForm.controls.paymentDate" label="Payment date" /></div>
                  <div class="full"><label [for]="'reference-' + invoice.id">Payment reference</label><input [id]="'reference-' + invoice.id" formControlName="proofReference" maxlength="180" placeholder="e.g. the reference on your bank confirmation"><span class="hint">Enter the reference Mansyd can use to match your payment. No file upload is required here.</span><app-validation-message [control]="paymentForm.controls.proofReference" label="Payment reference" /></div>
                  <div class="full"><label [for]="'payment-notes-' + invoice.id">Additional details (optional)</label><input [id]="'payment-notes-' + invoice.id" formControlName="notes" placeholder="e.g. Deposit for installation"></div>
                </div>
                <p class="muted">Your submission will show as Awaiting review. The balance changes after Mansyd approves the payment.</p>
                <button type="submit" class="primary-button compact">Send payment details for review</button>
              </form>
            }
          </article>
        } @empty {
          <div class="empty-state"><strong>No invoices yet</strong><span>Invoices will appear here after they are created.</span></div>
        }
      </div>

      <div class="list-stack">
        <h2 class="section-title">Payments</h2>
        <p class="muted">{{ carpenterMode() ? 'Check the amount, date and reference against payments received before approving. Rejected submissions do not reduce the invoice balance.' : 'Track your submissions here. Awaiting review means Mansyd is checking the payment; Approved means it has been credited to your invoice.' }}</p>
        @for (payment of payments(); track payment.id) {
          <article class="work-card request-card">
            <div>
              <strong>{{ payment.invoiceNumber }}</strong>
              <p>{{ payment.customerName }} · {{ payment.amount | number:'1.2-2' }} · {{ payment.paymentDate | date:'mediumDate' }}</p>
              <span class="muted">Payment reference: {{ payment.proofReference }}</span>
              @if (payment.notes) { <p>Notes: {{ payment.notes }}</p> }
              @if (payment.status === 'REJECTED') { <p class="muted">{{ carpenterMode() ? 'This payment was rejected and has not been credited.' : 'This submission was rejected. Contact Mansyd to clarify the payment, then submit corrected details if needed.' }}</p> }
            </div>
            <div class="status-actions">
              <span class="status-pill">{{ payment.status === 'PENDING_REVIEW' ? 'Awaiting review' : payment.status === 'APPROVED' ? 'Approved' : 'Rejected' }}</span>
              @if (carpenterMode() && payment.status === 'PENDING_REVIEW') {
                <button type="button" class="text-button dark" (click)="approve(payment)">Approve received payment</button>
                <button type="button" class="text-button dark" (click)="reject(payment)">Reject payment details</button>
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
    if (this.paymentForm.controls.amount.value > invoice.balanceDue) {
      this.paymentForm.controls.amount.setErrors({ max: { max: invoice.balanceDue, actual: this.paymentForm.controls.amount.value } });
      this.paymentForm.controls.amount.markAsTouched();
      this.notifications.error('The payment amount cannot exceed the outstanding invoice balance.');
      return;
    }
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
