import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton } from '@ionic/angular/standalone';
import { CustomerAuth } from './auth.service';
import { MobileApi, errorMessage } from './api.service';
import { Page, Project } from './models';
@Component({ standalone: true, imports: [RouterLink, IonButton], template: `<p class="eyebrow">Your workspace</p><h1>Hello, {{ auth.user()?.displayName }}</h1><p class="muted">A little closer to the home you imagined.</p>
  @if (loading()) { <p role="status">Loading your projects…</p> } @else if (error()) { <p class="error" role="alert">{{ error() }}</p><ion-button (click)="load()">Try again</ion-button> } @else {
    <a class="hero-card" routerLink="/projects"><span>Your projects</span><strong>{{ total() }}</strong><span>View progress and share an update →</span></a>
    <h2>Needs your review</h2>@for (project of pending(); track project.id) { <a class="project-card" [routerLink]="['/projects', project.id]"><strong>{{ project.projectNumber }}</strong><p>Your installed work is ready. Confirm completion or tell us what needs attention.</p><span class="pill">Review work →</span></a> } @empty { <p class="muted">You’re up to date. We’ll let you know when your work is ready for review.</p> }
    <a class="outline-card" routerLink="/notifications"><strong>Stay in the loop</strong><p>Read your latest project notifications →</p></a>
  }` })
export class HomePage {
  readonly auth = inject(CustomerAuth); private readonly api = inject(MobileApi);
  readonly loading = signal(true); readonly error = signal(''); readonly total = signal(0); readonly projects = signal<Project[]>([]);
  readonly pending = computed(() => this.projects().filter(p => p.completionReviewStatus === 'PENDING_REVIEW'));
  constructor() { void this.load(); }
  async load(): Promise<void> { this.loading.set(true); this.error.set(''); try {
    let page = await this.api.get<Page<Project>>('/projects/my?size=100&sort=createdAt,desc'); this.total.set(page.totalElements);
    const projects = [...page.content]; for (let index = 1; index < page.totalPages; index++) { page = await this.api.get<Page<Project>>(`/projects/my?size=100&page=${index}&sort=createdAt,desc`); projects.push(...page.content); }
    this.projects.set(projects);
  } catch (error) { this.error.set(errorMessage(error)); } finally { this.loading.set(false); } }
}
