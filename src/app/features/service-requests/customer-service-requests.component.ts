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
        <p class="muted">Submit work details and track the carpentry team's review status.</p>
      </div>

      <div class="requests-layout">
        <form class="work-card request-form-card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="section-kicker">
            <span>New request</span>
            <strong>Tell us what you need built</strong>
          </div>
          <div class="form-grid">
            <div class="full">
              <label for="titleChoice">Project type</label>
              <select id="titleChoice" formControlName="titleChoice">
                <option value="">Select a project type</option>
                @for (title of projectTypes; track title) { <option [value]="title">{{ title }}</option> }
              </select>
              <app-validation-message [control]="form.controls.titleChoice" label="Project type" />
            </div>
            @if (form.controls.titleChoice.value === 'Other') {
              <div class="full">
                <label for="customTitle">Special requirement</label>
                <input id="customTitle" formControlName="customTitle" placeholder="Describe the type of work">
                <app-validation-message [control]="form.controls.customTitle" label="Special requirement" />
              </div>
            }
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
  readonly projectTypes = ['Kitchen cabinetry', 'Built-in cupboards', 'Custom furniture', 'Doors and frames', 'Shelving and storage', 'Repairs and alterations', 'Other'];
  readonly form = this.fb.nonNullable.group({
    titleChoice: ['', Validators.required],
    customTitle: ['', Validators.maxLength(140)],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
    preferredContactMethod: ['', [Validators.required, Validators.maxLength(30)]],
    siteAddress: ['', [Validators.required, Validators.maxLength(300)]]
  });

  ngOnInit(): void { this.load(); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    if (value.titleChoice === 'Other' && !value.customTitle.trim()) {
      this.form.controls.customTitle.setErrors({ required: true });
      this.form.controls.customTitle.markAsTouched();
      return;
    }
    this.saving.set(true);
    const request = {
      title: value.titleChoice === 'Other' ? value.customTitle.trim() : value.titleChoice,
      description: value.description,
      preferredContactMethod: value.preferredContactMethod,
      siteAddress: value.siteAddress
    };
    this.api.create(request).pipe(finalize(() => this.saving.set(false))).subscribe(() => {
      this.notifications.success('Service request submitted.');
      this.form.reset({ titleChoice: '', customTitle: '', description: '', preferredContactMethod: '', siteAddress: '' });
      this.load();
    });
  }

  private load(): void {
    this.api.myRequests().subscribe(page => this.requests.set(page.content));
  }
}
