import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PortfolioUpload } from '../models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class PortfolioApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/portfolio`;

  all(): Observable<PortfolioUpload[]> { return this.http.get<PortfolioUpload[]>(this.url); }

  upload(title: string, category: string, description: string, file: File): Observable<PortfolioUpload> {
    const data = new FormData();
    data.append('title', title);
    data.append('category', category);
    data.append('description', description);
    data.append('file', file, file.name);
    return this.http.post<PortfolioUpload>(this.url, data);
  }

  contentUrl(id: string): string { return `${this.url}/${id}/content`; }
}
