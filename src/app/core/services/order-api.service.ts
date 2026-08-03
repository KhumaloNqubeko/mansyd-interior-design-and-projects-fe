import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderStatus } from '../models/order.models';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/orders`;

  all(page = 0, size = 20): Observable<PageResponse<Order>> {
    return this.http.get<PageResponse<Order>>(`${this.url}?page=${page}&size=${size}`);
  }

  my(page = 0, size = 20): Observable<PageResponse<Order>> {
    return this.http.get<PageResponse<Order>>(`${this.url}/my?page=${page}&size=${size}`);
  }

  updateStatus(id: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.url}/${id}/status`, { status });
  }
}
