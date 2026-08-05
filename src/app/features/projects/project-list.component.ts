import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Project, ProjectStatus, ProjectTimelineEntry } from '../../core/models/project.models';
import { NotificationService } from '../../core/services/notification.service';
import { ProjectApiService } from '../../core/services/project-api.service';
import { ValidationMessageComponent } from '../../shared/components/validation-message.component';

@Component({
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, ValidationMessageComponent],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Projects</p>
        <h1>{{ carpenterMode() ? 'Project delivery' : 'My project timeline' }}</h1>
        <p class="muted">{{ carpenterMode()
          ? 'Move each accepted order through the delivery steps. The system handles progress and dates.'
          : 'Follow the delivery progress and timeline updates for your accepted work.' }}</p>
      </div>

      <div class="list-stack">
        @for (project of projects(); track project.id) {
          <article class="work-card project-card-simple">
            <div class="quote-head">
              <div>
                <strong>{{ project.projectNumber }}</strong>
                <p>{{ project.orderNumber }} · {{ project.customerName }}</p>
              </div>
              <span class="status-pill">{{ statusLabel(project.status) }} · {{ project.progress }}%</span>
            </div>

            <div class="progress-track"><span [style.width.%]="project.progress"></span></div>

            <div class="project-summary-line">
              <span>Planned: {{ project.plannedStartDate || 'Not set' }} → {{ project.plannedCompletionDate || 'Not set' }}</span>
              <span>Started: {{ project.actualStartDate || 'Not yet' }}</span>
              <span>Completed: {{ project.actualCompletionDate || 'Not yet' }}</span>
            </div>
            @if (project.notes) { <p>{{ project.notes }}</p> }

            @if (carpenterMode()) {
              <section class="next-step-panel">
                <div>
                  <strong>Next step</strong>
                  <p class="muted">Choose one valid move. Progress and dates update automatically.</p>
                </div>
                <div class="status-step-actions">
                  @for (status of nextStatuses(project); track status) {
                    <button type="button" class="primary-button compact" (click)="updateStatus(project, status)">
                      Move to {{ statusLabel(status) }}
                    </button>
                  } @empty {
                    <span class="muted">This project has no next delivery step.</span>
                  }
                </div>
              </section>

              <div class="project-secondary-actions">
                <details (toggle)="prepareDetails(project)">
                  <summary>Edit plan / notes</summary>
                  <form class="inline-form project-dates simplified-form" [formGroup]="detailsForm" (ngSubmit)="updateDetails(project)" novalidate>
                    <label>Planned start <input type="date" formControlName="plannedStartDate"></label>
                    <label>Planned finish <input type="date" formControlName="plannedCompletionDate"></label>
                    <label>Notes <input formControlName="notes" placeholder="Internal project notes"></label>
                    <button type="submit" class="text-button dark">Save</button>
                  </form>
                </details>

                <details>
                  <summary>Add customer update</summary>
                  <form class="inline-form project-update simplified-form" [formGroup]="timelineForm" (ngSubmit)="addUpdate(project)" novalidate>
                    <input formControlName="title" placeholder="Title, e.g. Materials ordered">
                    <input formControlName="message" placeholder="Short customer-facing update">
                    <button type="submit" class="text-button dark">Add</button>
                  </form>
                  <app-validation-message [control]="timelineForm.controls.title" label="Update title" />
                </details>
              </div>
            }

            <button type="button" class="text-button dark compact-link" (click)="toggleTimeline(project)">
              {{ selectedProjectId() === project.id ? 'Hide timeline' : 'View timeline' }}
            </button>

            @if (selectedProjectId() === project.id) {
              <div class="timeline-list">
                @for (entry of timeline(); track entry.id) {
                  <div class="timeline-entry">
                    <strong>{{ entry.title }}</strong>
                    <span>{{ entry.createdAt | date:'medium' }} · {{ entry.createdByRole }}</span>
                    <p>{{ entry.message }}</p>
                  </div>
                } @empty {
                  <p class="muted">No timeline updates yet.</p>
                }
              </div>
            }
          </article>
        } @empty {
          <div class="empty-state"><strong>No projects yet</strong><span>Accepted quotations create orders, and orders create projects.</span></div>
        }
      </div>
    </section>
  `
})
export class ProjectListComponent implements OnInit {
  private readonly api = inject(ProjectApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  readonly projects = signal<Project[]>([]);
  readonly timeline = signal<ProjectTimelineEntry[]>([]);
  readonly selectedProjectId = signal<string | null>(null);
  readonly carpenterMode = signal(false);
  readonly detailsForm = this.fb.nonNullable.group({
    plannedStartDate: [''],
    plannedCompletionDate: [''],
    notes: ['', Validators.maxLength(1000)]
  });
  readonly timelineForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(140)]],
    message: ['', [Validators.required, Validators.maxLength(2000)]]
  });

  ngOnInit(): void {
    this.carpenterMode.set(this.route.snapshot.data['scope'] === 'carpenter');
    this.load();
  }

  updateStatus(project: Project, status: ProjectStatus): void {
    const today = this.today();
    this.api.updateStatus(project.id, {
      status,
      progress: this.progressFor(status),
      actualCompletionDate: status === 'COMPLETED' ? today : project.actualCompletionDate || null
    }).subscribe(updated => {
      this.replace(this.normalizedStatusProject(project, updated, status, today));
      this.notifications.success('Project status updated.');
    });
  }

  updateDetails(project: Project): void {
    if (this.detailsForm.invalid) { this.detailsForm.markAllAsTouched(); return; }
    const value = this.detailsForm.getRawValue();
    this.api.update(project.id, {
      plannedStartDate: value.plannedStartDate || project.plannedStartDate || null,
      plannedCompletionDate: value.plannedCompletionDate || project.plannedCompletionDate || null,
      notes: value.notes
    }).subscribe(updated => {
      this.replace(updated);
      this.notifications.success('Project details saved.');
    });
  }

  addUpdate(project: Project): void {
    if (this.timelineForm.invalid) { this.timelineForm.markAllAsTouched(); return; }
    this.api.addUpdate(project.id, this.timelineForm.getRawValue()).subscribe(entry => {
      if (this.selectedProjectId() === project.id) this.timeline.update(items => [entry, ...items]);
      this.timelineForm.reset();
      this.notifications.success('Timeline update added.');
    });
  }

  toggleTimeline(project: Project): void {
    if (this.selectedProjectId() === project.id) {
      this.selectedProjectId.set(null);
      this.timeline.set([]);
      return;
    }
    this.selectedProjectId.set(project.id);
    this.api.updates(project.id).subscribe(page => this.timeline.set(page.content));
  }

  prepareDetails(project: Project): void {
    this.detailsForm.patchValue({
      plannedStartDate: project.plannedStartDate || '',
      plannedCompletionDate: project.plannedCompletionDate || '',
      notes: project.notes || ''
    });
  }

  statusLabel(status: ProjectStatus): string {
    return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
  }

  nextStatuses(project: Project): ProjectStatus[] {
    const transitions: Record<ProjectStatus, ProjectStatus[]> = {
      CREATED: ['SCHEDULED', 'CANCELLED'],
      SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['AWAITING_MATERIALS', 'ON_HOLD', 'QUALITY_INSPECTION', 'CANCELLED'],
      AWAITING_MATERIALS: ['IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
      ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
      QUALITY_INSPECTION: ['READY_FOR_DELIVERY', 'IN_PROGRESS'],
      READY_FOR_DELIVERY: ['DELIVERED'],
      DELIVERED: ['INSTALLED'],
      INSTALLED: ['COMPLETED'],
      COMPLETED: [],
      CANCELLED: []
    };
    return transitions[project.status];
  }

  private load(): void {
    const source = this.carpenterMode() ? this.api.all() : this.api.my();
    source.subscribe(page => this.projects.set(page.content));
  }

  private replace(updated: Project): void {
    this.projects.update(items => items.map(item => item.id === updated.id ? updated : item));
  }

  progressFor(status: ProjectStatus): number {
    return {
      CREATED: 0,
      SCHEDULED: 10,
      IN_PROGRESS: 25,
      AWAITING_MATERIALS: 35,
      ON_HOLD: 35,
      QUALITY_INSPECTION: 70,
      READY_FOR_DELIVERY: 80,
      DELIVERED: 90,
      INSTALLED: 95,
      COMPLETED: 100,
      CANCELLED: 0
    }[status];
  }

  private normalizedStatusProject(previous: Project, updated: Project, status: ProjectStatus, today: string): Project {
    return {
      ...updated,
      status,
      progress: this.progressFor(status),
      actualStartDate: updated.actualStartDate || previous.actualStartDate || (this.startsWork(status) ? today : null),
      actualCompletionDate: status === 'COMPLETED' ? (updated.actualCompletionDate || today) : updated.actualCompletionDate
    };
  }

  private startsWork(status: ProjectStatus): boolean {
    return ['IN_PROGRESS', 'AWAITING_MATERIALS', 'ON_HOLD', 'QUALITY_INSPECTION',
      'READY_FOR_DELIVERY', 'DELIVERED', 'INSTALLED', 'COMPLETED'].includes(status);
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
