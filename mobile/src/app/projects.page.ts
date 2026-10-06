import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton } from '@ionic/angular/standalone';
import { MobileApi, errorMessage } from './api.service';
import { Page, Project } from './models';
@Component({ standalone: true, imports: [RouterLink, IonButton], template: `<p class="eyebrow">Made for you</p><h1>My projects</h1><p class="muted">See what’s happening and share your feedback.</p>
  @if (loading()) { <p role="status">Loading projects…</p> } @else if (error()) { <p class="error" role="alert">{{ error() }}</p><ion-button (click)="load(page())">Try again</ion-button> } @else {
    @for (project of projects(); track project.id) { <a class="project-card" [routerLink]="['/projects', project.id]"><div class="row"><strong>{{ project.projectNumber }}</strong><span class="pill">{{ project.progress }}%</span></div><p>{{ label(project.status) }}</p><div class="progress" role="progressbar" [attr.aria-valuenow]="project.progress" aria-valuemin="0" aria-valuemax="100" aria-label="Project progress"><span [style.width.%]="project.progress"></span></div><p class="small muted">Planned finish: {{ project.plannedCompletionDate || 'To be arranged' }}</p>@if (project.completionReviewStatus === 'PENDING_REVIEW') { <span class="pill">Ready for your review</span> }</a> }
    @empty { <div class="outline-card"><h2>No projects yet</h2><p>Your accepted work will appear here once a project is created.</p></div> }
    <div class="pagination"><ion-button fill="outline" (click)="load(page() - 1)" [disabled]="page() === 0">Previous</ion-button><span>{{ page() + 1 }} / {{ pages() || 1 }}</span><ion-button fill="outline" (click)="load(page() + 1)" [disabled]="page() + 1 >= pages()">Next</ion-button></div>
  }` })
export class ProjectsPage {
  private readonly api = inject(MobileApi); readonly projects = signal<Project[]>([]); readonly loading = signal(true); readonly error = signal(''); readonly page = signal(0); readonly pages = signal(0);
  constructor() { void this.load(0); }
  label(value: string): string { return value.replaceAll('_', ' ').toLowerCase(); }
  async load(page: number): Promise<void> { this.page.set(page); this.loading.set(true); this.error.set(''); try { const data = await this.api.get<Page<Project>>(`/projects/my?page=${page}&size=20&sort=createdAt,desc`); this.projects.set(data.content); this.pages.set(data.totalPages); } catch (error) { this.error.set(errorMessage(error)); } finally { this.loading.set(false); } }
}
