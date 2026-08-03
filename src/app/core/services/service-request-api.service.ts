import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/page.model';
import { ServiceRequest, ServiceRequestStatus, ServiceRequestUpsertRequest } from '../models/service-request.models';

@Injectable({ providedIn: 'root' })
export class ServiceRequestApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/service-requests`;

  create(request: ServiceRequestUpsertRequest): Observable<ServiceRequest> {
    return this.http.post<ServiceRequest>(this.url, request);
  }

  myRequests(page = 0, size = 20): Observable<PageResponse<ServiceRequest>> {
    return this.http.get<PageResponse<ServiceRequest>>(`${this.url}/my?page=${page}&size=${size}`);
  }

  all(page = 0, size = 20): Observable<PageResponse<ServiceRequest>> {
    return this.http.get<PageResponse<ServiceRequest>>(`${this.url}?page=${page}&size=${size}`);
  }

  get(id: string): Observable<ServiceRequest> {
    return this.http.get<ServiceRequest>(`${this.url}/${id}`);
  }

  update(id: string, request: ServiceRequestUpsertRequest): Observable<ServiceRequest> {
    return this.http.put<ServiceRequest>(`${this.url}/${id}`, request);
  }

  updateStatus(id: string, status: ServiceRequestStatus): Observable<ServiceRequest> {
    return this.http.patch<ServiceRequest>(`${this.url}/${id}/status`, { status });
  }
}
