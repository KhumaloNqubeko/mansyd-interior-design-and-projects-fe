import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerProfile, CustomerProfileUpdateRequest } from '../models/customer.models';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/customers`;

  myProfile(): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${this.url}/me`);
  }

  updateMyProfile(request: CustomerProfileUpdateRequest): Observable<CustomerProfile> {
    return this.http.put<CustomerProfile>(`${this.url}/me`, request);
  }

  list(page = 0, size = 20): Observable<PageResponse<CustomerProfile>> {
    return this.http.get<PageResponse<CustomerProfile>>(`${this.url}?page=${page}&size=${size}`);
  }

  get(id: string): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${this.url}/${id}`);
  }
}
