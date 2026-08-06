import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AppNotification } from '../../core/models/notification.models';
import { Project } from '../../core/models/project.models';
import { Quotation } from '../../core/models/quotation.models';
import { NotificationApiService } from '../../core/services/notification-api.service';
import { ProjectApiService } from '../../core/services/project-api.service';
import { QuotationApiService } from '../../core/services/quotation-api.service';

@Component({
  standalone: true,
  imports: [AsyncPipe, DatePipe, RouterLink],
  template: `
    <section class="dashboard">
      <p class="eyebrow">Overview</p>
      @if (auth.currentUser$ | async; as user) {
        <h1>Good to see you, {{ user.displayName }}</h1>
      }
      <p class="muted">Here is what needs your attention and what is currently happening with your work.</p>

      <section class="dashboard-panel portfolio-carousel-panel">
        <div class="history-heading">
          <div>
            <p class="eyebrow">Showcase</p>
            <h2>Featured carpenter work</h2>
          </div>
          <a class="text-button dark" [routerLink]="portfolioLink()">Browse all</a>
        </div>
        <div class="portfolio-carousel" aria-label="Featured portfolio photos">
          @for (image of featuredPortfolio; track image.src) {
            <a class="portfolio-slide" [routerLink]="portfolioLink()">
              <img [src]="image.src" [alt]="image.title" loading="lazy">
              <span>{{ image.title }}</span>
            </a>
          }
        </div>
      </section>

      <div class="dashboard-metrics">
        <a [routerLink]="projectsLink()">
          <span>Active projects</span>
          <strong>{{ activeProjects().length }}</strong>
        </a>
        <a [routerLink]="quotationsLink()">
          <span>{{ isCarpenter() ? 'Customer quotes' : 'Quotes to review' }}</span>
          <strong>{{ pendingQuotes().length }}</strong>
        </a>
        <a [routerLink]="notificationsLink()">
          <span>Unread notifications</span>
          <strong>{{ unreadNotifications().length }}</strong>
        </a>
      </div>

      @if (attentionItems().length) {
        <section class="dashboard-panel">
          <div class="history-heading">
            <h2>Needs your attention</h2>
            <span class="status-pill">{{ attentionItems().length }}</span>
          </div>
          <div class="dashboard-list">
            @for (item of attentionItems(); track item.title) {
              <a [routerLink]="item.link">
                <strong>{{ item.title }}</strong>
                <span>{{ item.description }}</span>
              </a>
            }
          </div>
        </section>
      }

      @if (currentProject(); as project) {
        <section class="dashboard-panel">
          <div class="history-heading">
            <div>
              <p class="eyebrow">Current project</p>
              <h2>{{ project.projectNumber }}</h2>
            </div>
            <span class="status-pill">{{ statusLabel(project.status) }} · {{ project.progress }}%</span>
          </div>
          <p>{{ project.orderNumber }} · {{ project.customerName }}</p>
          <div class="progress-track"><span [style.width.%]="project.progress"></span></div>
          <div class="project-summary-line">
            <span>Planned: {{ project.plannedStartDate || 'Not set' }} → {{ project.plannedCompletionDate || 'Not set' }}</span>
            <span>Started: {{ project.actualStartDate || 'Not yet' }}</span>
            <span>Completed: {{ project.actualCompletionDate || 'Not yet' }}</span>
          </div>
          @if (project.notes) { <p class="muted">{{ project.notes }}</p> }
          <a class="text-button dark compact-link" [routerLink]="projectsLink()">View project</a>
        </section>
      } @else if (!loading()) {
        <div class="empty-state">
          <strong>No active project yet</strong>
          <span>Accepted quotations become orders, and orders create projects here.</span>
        </div>
      }

      @if (recentNotifications().length) {
        <section class="dashboard-panel">
          <div class="history-heading">
            <h2>Recent updates</h2>
            <a class="text-button dark" [routerLink]="notificationsLink()">View all</a>
          </div>
          <div class="dashboard-list">
            @for (notification of recentNotifications(); track notification.id) {
              <a [routerLink]="notificationsLink()">
                <strong>{{ notification.title }}</strong>
                <span>{{ notification.message }} · {{ notification.createdAt | date:'mediumDate' }}</span>
              </a>
            }
          </div>
        </section>
      }
    </section>
  `
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly projectsApi = inject(ProjectApiService);
  private readonly quotationsApi = inject(QuotationApiService);
  private readonly notificationsApi = inject(NotificationApiService);

  readonly loading = signal(true);
  readonly projects = signal<Project[]>([]);
  readonly quotations = signal<Quotation[]>([]);
  readonly notifications = signal<AppNotification[]>([]);
  readonly isCarpenter = computed(() => this.auth.currentUser?.role === 'CARPENTER');

  readonly activeProjects = computed(() => this.projects().filter(project =>
    !['COMPLETED', 'CANCELLED'].includes(project.status)
  ));
  readonly currentProject = computed(() => this.activeProjects()[0] ?? null);
  readonly pendingQuotes = computed(() => this.quotations().filter(quote => quote.status === 'PENDING_CUSTOMER'));
  readonly unreadNotifications = computed(() => this.notifications().filter(notification => !notification.read));
  readonly recentNotifications = computed(() => this.notifications().slice(0, 4));
  readonly attentionItems = computed(() => [
    ...this.pendingQuotes().map(quote => ({
      title: `Review quotation ${quote.quotationNumber}`,
      description: `${quote.total.toFixed(2)} · Expires ${quote.expiryDate}`,
      link: this.quotationsLink()
    })),
    ...this.unreadNotifications().slice(0, 3).map(notification => ({
      title: notification.title,
      description: notification.message,
      link: this.notificationsLink()
    }))
  ]);
  readonly featuredPortfolio = [
    { src: '/portfolio/portfolio-06.jpg', title: 'Illuminated kitchen cabinetry' },
    { src: '/portfolio/portfolio-03.jpg', title: 'Wood slat TV feature wall' },
    { src: '/portfolio/portfolio-11.jpg', title: 'Modern fitted kitchen' },
    { src: '/portfolio/portfolio-08.jpg', title: 'Marble TV wall unit' },
    { src: '/portfolio/portfolio-09.jpg', title: 'Bedroom storage solution' }
  ];

  ngOnInit(): void {
    const projects$ = this.auth.currentUser?.role === 'CARPENTER' ? this.projectsApi.all() : this.projectsApi.my();
    const quotations$ = this.auth.currentUser?.role === 'CARPENTER' ? this.quotationsApi.all() : this.quotationsApi.my();

    projects$.subscribe(page => {
      this.projects.set(page.content);
      this.loading.set(false);
    });
    quotations$.subscribe(page => this.quotations.set(page.content));
    this.notificationsApi.notifications().subscribe(page => this.notifications.set(page.content));
  }

  statusLabel(status: Project['status']): string {
    return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
  }

  projectsLink(): string {
    return this.isCarpenter() ? '/carpenter/projects' : '/customer/projects';
  }

  quotationsLink(): string {
    return this.isCarpenter() ? '/carpenter/quotations' : '/customer/quotations';
  }

  notificationsLink(): string {
    return this.isCarpenter() ? '/carpenter/notifications' : '/customer/notifications';
  }

  portfolioLink(): string {
    return this.isCarpenter() ? '/carpenter/portfolio' : '/customer/portfolio';
  }
}
