import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/page.model';
import { Quotation, QuotationCreateRequest, QuotationItemRequest, QuotationRejectRequest, QuotationUpdateRequest } from '../models/quotation.models';

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

  update(id: string, request: QuotationUpdateRequest): Observable<Quotation> {
    return this.http.put<Quotation>(`${this.url}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  addItem(id: string, request: QuotationItemRequest): Observable<Quotation> {
    return this.http.post<Quotation>(`${this.url}/${id}/items`, request);
  }

  updateItem(id: string, itemId: string, request: QuotationItemRequest): Observable<Quotation> {
    return this.http.put<Quotation>(`${this.url}/${id}/items/${itemId}`, request);
  }

  deleteItem(id: string, itemId: string): Observable<Quotation> {
    return this.http.delete<Quotation>(`${this.url}/${id}/items/${itemId}`);
  }

  submit(id: string): Observable<Quotation> {
    return this.http.patch<Quotation>(`${this.url}/${id}/submit`, {});
  }

  accept(id: string): Observable<Quotation> {
    return this.http.patch<Quotation>(`${this.url}/${id}/accept`, {});
  }

  reject(id: string, request: QuotationRejectRequest): Observable<Quotation> {
    return this.http.patch<Quotation>(`${this.url}/${id}/reject`, request);
  }
}
