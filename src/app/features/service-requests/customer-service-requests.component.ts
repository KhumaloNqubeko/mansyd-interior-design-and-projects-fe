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
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Requests</p>
        <h1>My service requests</h1>
        <p class="muted">Submit work details and track the carpenter's review status.</p>
      </div>

      <form class="work-card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="form-grid">
          <div class="full"><label for="title">Title</label><input id="title" formControlName="title"><app-validation-message [control]="form.controls.title" label="Title" /></div>
          <div class="full"><label for="description">Description</label><textarea id="description" formControlName="description"></textarea><app-validation-message [control]="form.controls.description" label="Description" /></div>
          <div><label for="preferredContactMethod">Preferred contact</label><input id="preferredContactMethod" formControlName="preferredContactMethod"><app-validation-message [control]="form.controls.preferredContactMethod" label="Preferred contact" /></div>
          <div><label for="siteAddress">Site address</label><input id="siteAddress" formControlName="siteAddress"><app-validation-message [control]="form.controls.siteAddress" label="Site address" /></div>
        </div>
        <button class="primary-button" type="submit" [disabled]="saving()">{{ saving() ? 'Submitting...' : 'Submit request' }}</button>
      </form>

      <div class="list-stack">
        @for (request of requests(); track request.id) {
          <article class="work-card request-card">
            <div>
              <strong>{{ request.title }}</strong>
              <p>{{ request.description }}</p>
              <span class="muted">{{ request.createdAt | date:'medium' }}</span>
            </div>
            <span class="status-pill">{{ request.status }}</span>
          </article>
        } @empty {
          <div class="empty-state"><strong>No requests yet</strong><span>Your submitted work requests will appear here.</span></div>
        }
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
