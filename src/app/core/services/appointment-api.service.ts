import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, AppointmentRequest, AppointmentStatus } from '../models/appointment.models';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/appointments`;

  all(): Observable<PageResponse<Appointment>> {
    return this.http.get<PageResponse<Appointment>>(this.url);
  }

  my(): Observable<PageResponse<Appointment>> {
    return this.http.get<PageResponse<Appointment>>(`${this.url}/my`);
  }

  create(request: AppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(this.url, request);
  }

  update(id: string, request: AppointmentRequest): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.url}/${id}`, request);
  }

  updateStatus(id: string, status: AppointmentStatus): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.url}/${id}/status`, { status });
  }
}
