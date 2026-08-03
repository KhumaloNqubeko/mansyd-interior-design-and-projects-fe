import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order, OrderStatus } from '../../core/models/order.models';
import { NotificationService } from '../../core/services/notification.service';
import { OrderApiService } from '../../core/services/order-api.service';

@Component({
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Orders</p>
        <h1>{{ carpenterMode() ? 'Customer orders' : 'My orders' }}</h1>
        <p class="muted">Orders are created automatically when a customer accepts a quotation.</p>
      </div>

      <div class="list-stack">
        @for (order of orders(); track order.id) {
          <article class="work-card request-card">
            <div>
              <strong>{{ order.orderNumber }}</strong>
              <p>{{ order.quotationNumber }} · {{ order.customerName }} · {{ order.acceptedTotal | number:'1.2-2' }}</p>
              <span class="muted">{{ order.createdAt | date:'medium' }}</span>
            </div>
            <div class="status-actions">
              <span class="status-pill">{{ order.status }}</span>
              @if (carpenterMode()) {
                <select [value]="order.status" (change)="changeStatus(order, $any($event.target).value)">
                  @for (status of statuses; track status) { <option [value]="status">{{ status }}</option> }
                </select>
              }
            </div>
          </article>
        } @empty {
          <div class="empty-state"><strong>No orders yet</strong><span>Accepted quotations will create orders here.</span></div>
        }
      </div>
    </section>
  `
})
export class OrderListComponent implements OnInit {
  private readonly api = inject(OrderApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);
  readonly orders = signal<Order[]>([]);
  readonly carpenterMode = signal(false);
  readonly statuses: OrderStatus[] = ['CREATED', 'CONFIRMED', 'IN_PROGRESS', 'ON_HOLD',
    'READY_FOR_DELIVERY', 'DELIVERED', 'INSTALLED', 'COMPLETED', 'CANCELLED'];

  ngOnInit(): void {
    this.carpenterMode.set(this.route.snapshot.data['scope'] === 'carpenter');
    this.load();
  }

  changeStatus(order: Order, status: OrderStatus): void {
    if (order.status === status) return;
    this.api.updateStatus(order.id, status).subscribe(updated => {
      this.orders.update(items => items.map(item => item.id === updated.id ? updated : item));
      this.notifications.success('Order status updated.');
    });
  }

  private load(): void {
    const source = this.carpenterMode() ? this.api.all() : this.api.my();
    source.subscribe(page => this.orders.set(page.content));
  }
}
