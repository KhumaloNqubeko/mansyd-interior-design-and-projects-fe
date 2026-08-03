import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ServiceRequest, ServiceRequestStatus } from '../../core/models/service-request.models';
import { NotificationService } from '../../core/services/notification.service';
import { ServiceRequestApiService } from '../../core/services/service-request-api.service';

@Component({
  standalone: true,
  imports: [DatePipe],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Carpenter queue</p>
        <h1>Service requests</h1>
        <p class="muted">Review submitted work and move requests through the early workflow.</p>
      </div>

      <div class="list-stack">
        @for (request of requests(); track request.id) {
          <article class="work-card request-card">
            <div>
              <strong>{{ request.title }}</strong>
              <p>{{ request.description }}</p>
              <span class="muted">{{ request.customerName }} · {{ request.siteAddress }} · {{ request.createdAt | date:'medium' }}</span>
            </div>
            <div class="status-actions">
              <span class="status-pill">{{ request.status }}</span>
              <select [value]="request.status" (change)="changeStatus(request, $any($event.target).value)">
                @for (status of statuses; track status) { <option [value]="status">{{ status }}</option> }
              </select>
            </div>
          </article>
        } @empty {
          <div class="empty-state"><strong>No requests yet</strong><span>Customer requests will appear here after submission.</span></div>
        }
      </div>
    </section>
  `
})
export class CarpenterServiceRequestsComponent implements OnInit {
  private readonly api = inject(ServiceRequestApiService);
  private readonly notifications = inject(NotificationService);
  readonly requests = signal<ServiceRequest[]>([]);
  readonly statuses: ServiceRequestStatus[] = ['SUBMITTED', 'UNDER_REVIEW', 'SITE_VISIT_REQUIRED',
    'QUOTATION_IN_PROGRESS', 'QUOTED', 'CANCELLED', 'CLOSED'];

  ngOnInit(): void { this.load(); }

  changeStatus(request: ServiceRequest, status: ServiceRequestStatus): void {
    if (request.status === status) return;
    this.api.updateStatus(request.id, status).subscribe(updated => {
      this.requests.update(items => items.map(item => item.id === updated.id ? updated : item));
      this.notifications.success('Request status updated.');
    });
  }

  private load(): void {
    this.api.all().subscribe(page => this.requests.set(page.content));
  }
}
