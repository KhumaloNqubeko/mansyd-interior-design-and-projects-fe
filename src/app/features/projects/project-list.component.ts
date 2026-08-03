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
        <p class="muted">Projects are created automatically when accepted quotations become orders.</p>
      </div>

      <div class="list-stack">
        @for (project of projects(); track project.id) {
          <article class="work-card quote-card">
            <div class="quote-head">
              <div>
                <strong>{{ project.projectNumber }}</strong>
                <p>{{ project.orderNumber }} · {{ project.customerName }}</p>
              </div>
              <span class="status-pill">{{ project.status }} · {{ project.progress }}%</span>
            </div>

            <div class="progress-track"><span [style.width.%]="project.progress"></span></div>
            <p class="muted">Planned: {{ project.plannedStartDate || 'Not set' }} to {{ project.plannedCompletionDate || 'Not set' }}</p>
            @if (project.notes) { <p>{{ project.notes }}</p> }

            @if (carpenterMode()) {
              <form class="inline-form project-inline" [formGroup]="statusForm" (ngSubmit)="updateStatus(project)" novalidate>
                <select formControlName="status">@for (status of statuses; track status) { <option [value]="status">{{ status }}</option> }</select>
                <input type="number" min="0" max="100" formControlName="progress" placeholder="Progress">
                <input type="date" formControlName="actualCompletionDate">
                <button type="submit" class="text-button dark">Update status</button>
              </form>

              <form class="inline-form project-dates" [formGroup]="detailsForm" (ngSubmit)="updateDetails(project)" novalidate>
                <input type="date" formControlName="plannedStartDate">
                <input type="date" formControlName="plannedCompletionDate">
                <input formControlName="notes" placeholder="Project notes">
                <button type="submit" class="text-button dark">Save details</button>
              </form>

              <form class="inline-form project-update" [formGroup]="timelineForm" (ngSubmit)="addUpdate(project)" novalidate>
                <input formControlName="title" placeholder="Update title">
                <input formControlName="message" placeholder="Timeline message">
                <button type="submit" class="text-button dark">Add update</button>
              </form>
              <app-validation-message [control]="timelineForm.controls.title" label="Update title" />
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
  readonly statuses: ProjectStatus[] = ['CREATED', 'SCHEDULED', 'IN_PROGRESS', 'AWAITING_MATERIALS', 'ON_HOLD',
    'QUALITY_INSPECTION', 'READY_FOR_DELIVERY', 'DELIVERED', 'INSTALLED', 'COMPLETED', 'CANCELLED'];
  readonly statusForm = this.fb.nonNullable.group({
    status: ['IN_PROGRESS' as ProjectStatus, Validators.required],
    progress: [25, [Validators.required, Validators.min(0), Validators.max(100)]],
    actualCompletionDate: ['']
  });
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

  updateStatus(project: Project): void {
    if (this.statusForm.invalid) { this.statusForm.markAllAsTouched(); return; }
    const value = this.statusForm.getRawValue();
    this.api.updateStatus(project.id, { status: value.status, progress: value.progress, actualCompletionDate: value.actualCompletionDate || null })
      .subscribe(updated => {
        this.replace(updated);
        this.notifications.success('Project status updated.');
      });
  }

  updateDetails(project: Project): void {
    if (this.detailsForm.invalid) { this.detailsForm.markAllAsTouched(); return; }
    const value = this.detailsForm.getRawValue();
    this.api.update(project.id, {
      plannedStartDate: value.plannedStartDate || null,
      plannedCompletionDate: value.plannedCompletionDate || null,
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

  private load(): void {
    const source = this.carpenterMode() ? this.api.all() : this.api.my();
    source.subscribe(page => this.projects.set(page.content));
  }

  private replace(updated: Project): void {
    this.projects.update(items => items.map(item => item.id === updated.id ? updated : item));
  }
}
