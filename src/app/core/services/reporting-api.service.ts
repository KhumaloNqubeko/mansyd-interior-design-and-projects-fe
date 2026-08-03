import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReportingOverview } from '../models/reporting.models';

@Injectable({ providedIn: 'root' })
export class ReportingApiService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiBaseUrl;

  overview(): Observable<ReportingOverview> {
    return this.http.get<ReportingOverview>(`${this.api}/reports/overview`);
  }
}
