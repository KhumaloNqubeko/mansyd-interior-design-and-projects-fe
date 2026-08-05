import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLog } from '../models/audit.models';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/audit-logs`;

  logs(filters: { entityType?: string; entityId?: string } = {}): Observable<PageResponse<AuditLog>> {
    let params = new HttpParams();
    if (filters.entityType) params = params.set('entityType', filters.entityType);
    if (filters.entityId) params = params.set('entityId', filters.entityId);
    return this.http.get<PageResponse<AuditLog>>(this.url, { params });
  }
}
