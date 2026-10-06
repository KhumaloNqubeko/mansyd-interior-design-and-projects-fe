import { Component, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Project } from '../../core/models/project.models';
import { ProjectActivity } from '../../core/models/project-activity.models';
import { PageResponse } from '../../core/models/page.model';
import { environment } from '../../../environments/environment';
import { ProjectPhotoComponent } from './project-photo.component';
@Component({ selector: 'app-project-conversation', standalone: true, imports: [FormsModule, DatePipe, ProjectPhotoComponent],
  template: `<section class="project-conversation"><h3>Customer conversation & photos</h3>
    @if (loading()) { <p role="status">Loading activity…</p> }
    @if (error()) { <p role="alert">{{ error() }}</p><button type="button" (click)="load()">Retry activity</button> }
    @for (entry of entries(); track entry.id) { <article class="client-contact"><strong>{{ entry.authorRole === 'CUSTOMER' ? 'Customer' : 'Mansyd' }} · {{ entry.kind.replaceAll('_', ' ') }}</strong><span>{{ entry.createdAt | date:'medium' }}</span><p style="white-space:pre-wrap;overflow-wrap:anywhere">{{ entry.message }}</p>@if (entry.kind === 'PHOTO') { <app-project-photo [source]="url + '/activity/' + entry.id + '/photo'" [description]="entry.message" /> }</article> }
    @if (!loading() && !error() && !entries().length) { <p>No activity yet.</p> }
    @if (page() + 1 < pages()) { <button type="button" (click)="load(true)" [disabled]="loading()">Older activity</button> }
    @if (project().status !== 'CANCELLED') { <form (ngSubmit)="send()"><label [for]="'reply-' + project().id">Reply to customer</label><textarea [id]="'reply-' + project().id" [(ngModel)]="message" name="message" maxlength="2000" required></textarea><button class="primary-button compact" type="submit" [disabled]="busy() || !message.trim()">{{ busy() ? 'Sending…' : 'Send reply' }}</button></form> }
  </section>` })
export class ProjectConversationComponent implements OnInit {
  readonly project = input.required<Project>(); private readonly http = inject(HttpClient);
  readonly entries = signal<ProjectActivity[]>([]); readonly loading = signal(false); readonly busy = signal(false); readonly error = signal(''); readonly page = signal(0); readonly pages = signal(0);
  message = ''; get url(): string { return `${environment.apiBaseUrl}/projects/${this.project().id}`; }
  ngOnInit(): void { this.load(); }
  load(more = false): void { if (this.loading()) return; this.loading.set(true); this.error.set(''); const page = more ? this.page() + 1 : 0;
    this.http.get<PageResponse<ProjectActivity>>(`${this.url}/activity?page=${page}`).pipe(finalize(() => this.loading.set(false))).subscribe({ next: data => { this.entries.set(more ? [...this.entries(), ...data.content.filter(entry => !this.entries().some(existing => existing.id === entry.id))] : data.content); this.page.set(data.page); this.pages.set(data.totalPages); }, error: () => this.error.set('Project activity could not be loaded.') }); }
  send(): void { if (this.busy() || !this.message.trim()) return; this.busy.set(true); this.error.set(''); this.http.post<ProjectActivity>(`${this.url}/comments`, { message: this.message.trim() }).pipe(finalize(() => this.busy.set(false))).subscribe({ next: () => { this.message = ''; this.load(); }, error: () => this.error.set('Reply could not be sent. Please try again.') }); }
}
