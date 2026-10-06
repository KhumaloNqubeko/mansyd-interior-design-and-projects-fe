import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { CustomerApiService } from '../../core/services/customer-api.service';
import { CustomerProfile } from '../../core/models/customer.models';
@Component({
  standalone: true,
  template: `<section class="dashboard"><div><p class="eyebrow">Customer directory</p><h1>Customers</h1><p class="muted">Contact and address details for registered customers.</p></div>
    @if (loading()) { <p role="status">Loading customers…</p> }
    @else if (failed()) { <p role="alert">Customers could not be loaded.</p><button class="primary-button" (click)="load(page())">Try again</button> }
    @else {
      <p>{{ total() }} registered customers</p><div class="dashboard-list">
      @for (customer of customers(); track customer.id) { <article class="client-contact"><strong>{{ customer.fullName }}</strong><a [href]="'mailto:' + customer.email">{{ customer.email }}</a><a [href]="'tel:' + customer.phoneNumber">{{ customer.phoneNumber }}</a><span>{{ customer.addressLine1 }} {{ customer.addressLine2 }} · {{ customer.city }} {{ customer.postalCode }}</span></article> }
      @empty { <p class="empty-state">No registered customers yet.</p> }</div>
      <nav class="admin-pagination" aria-label="Customer pages"><button (click)="load(page() - 1)" [disabled]="page() === 0">Previous</button><span>Page {{ page() + 1 }} of {{ pages() || 1 }}</span><button (click)="load(page() + 1)" [disabled]="page() + 1 >= pages()">Next</button></nav>
    }</section>`
})
export class CustomersComponent {
  private readonly api = inject(CustomerApiService);
  readonly customers = signal<CustomerProfile[]>([]); readonly loading = signal(false); readonly failed = signal(false);
  readonly page = signal(0); readonly pages = signal(0); readonly total = signal(0);
  constructor() { this.load(0); }
  load(page: number): void { this.page.set(page); this.loading.set(true); this.failed.set(false);
    this.api.list(page).pipe(finalize(() => this.loading.set(false))).subscribe({ next: data => { this.customers.set(data.content); this.pages.set(data.totalPages); this.total.set(data.totalElements); }, error: () => this.failed.set(true) }); }
}
