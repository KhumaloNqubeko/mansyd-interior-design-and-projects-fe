import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../models/page.model';
import { Project, ProjectStatusUpdateRequest, ProjectTimelineEntry, ProjectTimelineRequest, ProjectUpdateRequest } from '../models/project.models';

@Injectable({ providedIn: 'root' })
export class ProjectApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/projects`;

  all(page = 0, size = 20): Observable<PageResponse<Project>> {
    return this.http.get<PageResponse<Project>>(`${this.url}?page=${page}&size=${size}`);
  }

  my(page = 0, size = 20): Observable<PageResponse<Project>> {
    return this.http.get<PageResponse<Project>>(`${this.url}/my?page=${page}&size=${size}`);
  }

  update(id: string, request: ProjectUpdateRequest): Observable<Project> {
    return this.http.put<Project>(`${this.url}/${id}`, request);
  }

  updateStatus(id: string, request: ProjectStatusUpdateRequest): Observable<Project> {
    return this.http.patch<Project>(`${this.url}/${id}/status`, request);
  }

  addUpdate(id: string, request: ProjectTimelineRequest): Observable<ProjectTimelineEntry> {
    return this.http.post<ProjectTimelineEntry>(`${this.url}/${id}/updates`, request);
  }

  updates(id: string): Observable<PageResponse<ProjectTimelineEntry>> {
    return this.http.get<PageResponse<ProjectTimelineEntry>>(`${this.url}/${id}/updates`);
  }
}
