import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BusinessDocument, DocumentRequest } from '../models/document.models';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class DocumentApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/documents`;

  all(): Observable<PageResponse<BusinessDocument>> {
    return this.http.get<PageResponse<BusinessDocument>>(this.url);
  }

  my(): Observable<PageResponse<BusinessDocument>> {
    return this.http.get<PageResponse<BusinessDocument>>(`${this.url}/my`);
  }

  create(request: DocumentRequest): Observable<BusinessDocument> {
    return this.http.post<BusinessDocument>(this.url, request);
  }

  update(id: string, request: DocumentRequest): Observable<BusinessDocument> {
    return this.http.put<BusinessDocument>(`${this.url}/${id}`, request);
  }

  archive(id: string): Observable<BusinessDocument> {
    return this.http.patch<BusinessDocument>(`${this.url}/${id}/archive`, {});
  }
}
