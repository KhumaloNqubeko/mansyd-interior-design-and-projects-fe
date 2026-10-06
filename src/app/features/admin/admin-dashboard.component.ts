import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, finalize } from 'rxjs';
import { CustomerApiService } from '../../core/services/customer-api.service';
import { ServiceRequestApiService } from '../../core/services/service-request-api.service';
import { PaymentApiService } from '../../core/services/payment-api.service';
import { ProjectApiService } from '../../core/services/project-api.service';
import { ServiceRequest } from '../../core/models/service-request.models';

@Component({
  standalone: true, imports: [RouterLink],
  template: `
    <section class="dashboard">
      <div><p class="eyebrow">Admin backoffice</p><h1>Business overview</h1>
      <p class="muted">Manage enquiries, customer work and delivery from one place.</p></div>
      @if (loading()) { <p role="status">Loading your business overview…</p> }
      @else if (failed()) { <div class="empty-state"><p role="alert">The overview could not be loaded.</p><button class="primary-button" (click)="load()">Try again</button></div> }
      @else {
        <div class="dashboard-metrics">
          <a routerLink="/admin/customers"><span>Registered customers</span><strong>{{ customers() }}</strong></a>
          <a routerLink="/admin/requests"><span>Total service requests</span><strong>{{ requests() }}</strong></a>
          <a routerLink="/admin/projects"><span>Total projects</span><strong>{{ projects() }}</strong></a>
        </div>
        <section class="dashboard-panel"><h2>Daily workspace</h2><div class="admin-actions">
          <a routerLink="/admin/requests"><strong>Review enquiries</strong><span>Assess new requests and move work forward.</span></a>
          <a routerLink="/admin/quotations"><strong>Prepare quotations</strong><span>Price work and send quotes to customers.</span></a>
          <a routerLink="/admin/billing"><strong>Review payments</strong><span>{{ pendingPayments() }} awaiting review in the latest {{ paymentSampleSize() }} payments.</span></a>
          <a routerLink="/admin/appointments"><strong>Schedule appointments</strong><span>Organise site visits and customer meetings.</span></a>
          <a routerLink="/admin/portfolio"><strong>Manage portfolio</strong><span>Maintain the work showcased on the website.</span></a>
          <a routerLink="/admin/audit-logs"><strong>Review activity</strong><span>Check recorded changes across the business.</span></a>
        </div></section>
        <section class="dashboard-panel"><div class="history-heading"><h2>Recent enquiries</h2><a routerLink="/admin/requests">View all</a></div>
          <div class="dashboard-list">@for (request of recentRequests(); track request.id) {
            <a routerLink="/admin/requests"><strong>{{ request.title }}</strong><span>{{ request.customerName }} · {{ request.status.replaceAll('_', ' ') }}</span></a>
          } @empty { <p class="muted">No enquiries yet. Customer requests will appear here.</p> }</div>
        </section>
      }
    </section>
  `
})
export class AdminDashboardComponent {
  private readonly customersApi = inject(CustomerApiService);
  private readonly requestsApi = inject(ServiceRequestApiService);
  private readonly projectsApi = inject(ProjectApiService);
  private readonly paymentsApi = inject(PaymentApiService);
  readonly loading = signal(false);
  readonly failed = signal(false);
  readonly customers = signal(0);
  readonly requests = signal(0);
  readonly projects = signal(0);
  readonly pendingPayments = signal(0);
  readonly paymentSampleSize = signal(0);
  readonly recentRequests = signal<ServiceRequest[]>([]);
  constructor() { this.load(); }
  load(): void {
    this.loading.set(true); this.failed.set(false);
    forkJoin({ customers: this.customersApi.list(0, 1), requests: this.requestsApi.all(0, 100), projects: this.projectsApi.all(), payments: this.paymentsApi.all(0, 100) })
      .pipe(finalize(() => this.loading.set(false))).subscribe({ next: data => {
        this.customers.set(data.customers.totalElements); this.requests.set(data.requests.totalElements); this.projects.set(data.projects.totalElements);
        this.recentRequests.set([...data.requests.content].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5));
        this.pendingPayments.set(data.payments.content.filter(p => p.status === 'PENDING_REVIEW').length); this.paymentSampleSize.set(data.payments.content.length);
      }, error: () => this.failed.set(true) });
  }
}
