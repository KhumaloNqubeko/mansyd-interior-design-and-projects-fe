import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ServiceRequest } from '../../core/models/service-request.models';
import { NotificationService } from '../../core/services/notification.service';
import { ServiceRequestApiService } from '../../core/services/service-request-api.service';
import { ValidationMessageComponent } from '../../shared/components/validation-message.component';

@Component({
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, ValidationMessageComponent],
  template: `
    <section class="panel-page requests-page">
      <div class="page-heading">
        <p class="eyebrow">Requests</p>
        <h1>My service requests</h1>
        <p class="muted">Submit work details and track the carpenter's review status.</p>
      </div>

      <div class="requests-layout">
        <form class="work-card request-form-card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="section-kicker">
            <span>New request</span>
            <strong>Tell us what you need built</strong>
          </div>
          <div class="form-grid">
            <div class="full">
              <label for="title">Title</label>
              <input id="title" formControlName="title" placeholder="e.g. Bedroom cupboards">
              <app-validation-message [control]="form.controls.title" label="Title" />
            </div>
            <div class="full">
              <label for="description">Description</label>
              <textarea id="description" formControlName="description" placeholder="Share dimensions, materials, timing, and anything useful for quoting."></textarea>
              <app-validation-message [control]="form.controls.description" label="Description" />
            </div>
            <div>
              <label for="preferredContactMethod">Preferred contact</label>
              <input id="preferredContactMethod" formControlName="preferredContactMethod" placeholder="Phone, WhatsApp, email">
              <app-validation-message [control]="form.controls.preferredContactMethod" label="Preferred contact" />
            </div>
            <div>
              <label for="siteAddress">Site address</label>
              <input id="siteAddress" formControlName="siteAddress" placeholder="Where should we visit?">
              <app-validation-message [control]="form.controls.siteAddress" label="Site address" />
            </div>
          </div>
          <button class="primary-button" type="submit" [disabled]="saving()">{{ saving() ? 'Submitting...' : 'Submit request' }}</button>
        </form>

        <aside class="request-history" aria-label="Submitted service requests">
          <div class="history-heading">
            <div>
              <p class="eyebrow">Submitted</p>
              <h2>Request history</h2>
            </div>
            <span class="status-pill">{{ requests().length }}</span>
          </div>
          <div class="list-stack compact-list">
            @for (request of requests(); track request.id) {
              <article class="work-card request-card history-card">
                <div>
                  <div class="card-title-row">
                    <strong>{{ request.title }}</strong>
                    <span class="status-pill">{{ request.status }}</span>
                  </div>
                  <p>{{ request.description }}</p>
                  <span class="muted">{{ request.createdAt | date:'medium' }}</span>
                </div>
              </article>
            } @empty {
              <div class="empty-state compact-empty"><strong>No requests yet</strong><span>Your submitted work requests will appear here.</span></div>
            }
          </div>
        </aside>
      </div>
    </section>
  `
})
export class CustomerServiceRequestsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ServiceRequestApiService);
  private readonly notifications = inject(NotificationService);
  readonly requests = signal<ServiceRequest[]>([]);
  readonly saving = signal(false);
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(140)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
    preferredContactMethod: ['', [Validators.required, Validators.maxLength(30)]],
    siteAddress: ['', [Validators.required, Validators.maxLength(300)]]
  });

  ngOnInit(): void { this.load(); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.api.create(this.form.getRawValue()).pipe(finalize(() => this.saving.set(false))).subscribe(() => {
      this.notifications.success('Service request submitted.');
      this.form.reset();
      this.load();
    });
  }

  private load(): void {
    this.api.myRequests().subscribe(page => this.requests.set(page.content));
  }
}
