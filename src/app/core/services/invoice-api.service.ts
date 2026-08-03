import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice, InvoiceCreateRequest } from '../models/invoice.models';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class InvoiceApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/invoices`;

  create(request: InvoiceCreateRequest): Observable<Invoice> {
    return this.http.post<Invoice>(this.url, request);
  }

  all(page = 0, size = 20): Observable<PageResponse<Invoice>> {
    return this.http.get<PageResponse<Invoice>>(`${this.url}?page=${page}&size=${size}`);
  }

  my(page = 0, size = 20): Observable<PageResponse<Invoice>> {
    return this.http.get<PageResponse<Invoice>>(`${this.url}/my?page=${page}&size=${size}`);
  }

  issue(id: string): Observable<Invoice> {
    return this.http.patch<Invoice>(`${this.url}/${id}/issue`, {});
  }
}
