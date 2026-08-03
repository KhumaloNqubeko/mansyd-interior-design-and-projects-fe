import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/page.model';
import { Payment, PaymentCreateRequest } from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/payments`;

  submit(request: PaymentCreateRequest): Observable<Payment> {
    return this.http.post<Payment>(this.url, request);
  }

  all(page = 0, size = 20): Observable<PageResponse<Payment>> {
    return this.http.get<PageResponse<Payment>>(`${this.url}?page=${page}&size=${size}`);
  }

  my(page = 0, size = 20): Observable<PageResponse<Payment>> {
    return this.http.get<PageResponse<Payment>>(`${this.url}/my?page=${page}&size=${size}`);
  }

  approve(id: string): Observable<Payment> {
    return this.http.patch<Payment>(`${this.url}/${id}/approve`, {});
  }

  reject(id: string, notes: string): Observable<Payment> {
    return this.http.patch<Payment>(`${this.url}/${id}/reject`, { notes });
  }
}
