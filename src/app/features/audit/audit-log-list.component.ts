import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuditLog } from '../../core/models/audit.models';
import { AuditApiService } from '../../core/services/audit-api.service';

@Component({
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Audit logs</p>
        <h1>Workflow activity</h1>
        <p class="muted">Review server-recorded actions across requests, appointments, invoices, payments and documents.</p>
      </div>

      <form class="work-card" [formGroup]="filters" (ngSubmit)="load()">
        <div class="form-grid">
          <div>
            <label for="entityType">Entity type</label>
            <input id="entityType" formControlName="entityType" placeholder="Payment, Invoice, Document...">
          </div>
          <div>
            <label for="entityId">Entity ID</label>
            <input id="entityId" formControlName="entityId" placeholder="Optional UUID">
          </div>
        </div>
        <button class="primary-button" type="submit">Apply filters</button>
        <button class="primary-button compact muted-button" type="button" (click)="clearFilters()">Clear</button>
      </form>

      <div class="list-stack">
        @for (log of logs(); track log.id) {
          <article class="work-card request-card">
            <div>
              <strong>{{ log.summary }}</strong>
              <p>{{ log.entityType }} · {{ log.entityId }}</p>
              <span class="muted">{{ log.actorEmail }} · {{ log.actorRole }} · {{ log.createdAt | date:'medium' }}</span>
            </div>
            <div class="status-actions">
              <span class="status-pill">{{ log.action }}</span>
            </div>
          </article>
        } @empty {
          <div class="empty-state"><strong>No audit logs yet</strong><span>Recorded workflow actions will appear here.</span></div>
        }
      </div>
    </section>
  `
})
export class AuditLogListComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auditApi = inject(AuditApiService);
  readonly logs = signal<AuditLog[]>([]);
  readonly filters = this.fb.nonNullable.group({
    entityType: [''],
    entityId: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const raw = this.filters.getRawValue();
    this.auditApi.logs({
      entityType: raw.entityType.trim() || undefined,
      entityId: raw.entityId.trim() || undefined
    }).subscribe(page => this.logs.set(page.content));
  }

  clearFilters(): void {
    this.filters.reset({ entityType: '', entityId: '' });
    this.load();
  }
}
