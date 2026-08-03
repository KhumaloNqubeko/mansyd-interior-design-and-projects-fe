import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/page.model';
import { Quotation, QuotationCreateRequest, QuotationItemRequest } from '../models/quotation.models';

@Injectable({ providedIn: 'root' })
export class QuotationApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/quotations`;

  create(request: QuotationCreateRequest): Observable<Quotation> {
    return this.http.post<Quotation>(this.url, request);
  }

  all(page = 0, size = 20): Observable<PageResponse<Quotation>> {
    return this.http.get<PageResponse<Quotation>>(`${this.url}?page=${page}&size=${size}`);
  }

  my(page = 0, size = 20): Observable<PageResponse<Quotation>> {
    return this.http.get<PageResponse<Quotation>>(`${this.url}/my?page=${page}&size=${size}`);
  }

  addItem(id: string, request: QuotationItemRequest): Observable<Quotation> {
    return this.http.post<Quotation>(`${this.url}/${id}/items`, request);
  }

  submit(id: string): Observable<Quotation> {
    return this.http.patch<Quotation>(`${this.url}/${id}/submit`, {});
  }

  accept(id: string): Observable<Quotation> {
    return this.http.patch<Quotation>(`${this.url}/${id}/accept`, {});
  }

  reject(id: string): Observable<Quotation> {
    return this.http.patch<Quotation>(`${this.url}/${id}/reject`, {});
  }
}
