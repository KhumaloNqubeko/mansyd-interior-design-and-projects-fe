import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Appointment, AppointmentStatus, AppointmentType } from '../../core/models/appointment.models';
import { CustomerProfile } from '../../core/models/customer.models';
import { Project } from '../../core/models/project.models';
import { ServiceRequest } from '../../core/models/service-request.models';
import { AppointmentApiService } from '../../core/services/appointment-api.service';
import { CustomerApiService } from '../../core/services/customer-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProjectApiService } from '../../core/services/project-api.service';
import { ServiceRequestApiService } from '../../core/services/service-request-api.service';
import { ValidationMessageComponent } from '../../shared/components/validation-message.component';

@Component({
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, ValidationMessageComponent],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Appointments</p>
        <h1>{{ carpenterMode() ? 'Schedule visits and installs' : 'My appointments' }}</h1>
        <p class="muted">Coordinate site visits, measurements, reviews and installation windows.</p>
      </div>

      @if (carpenterMode()) {
        <form class="work-card" [formGroup]="appointmentForm" (ngSubmit)="save()" novalidate>
          <div class="form-grid">
            <div>
              <label for="title">Title</label>
              <input id="title" formControlName="title">
              <app-validation-message [control]="appointmentForm.controls.title" label="Title" />
            </div>
            <div>
              <label for="type">Type</label>
              <select id="type" formControlName="type">@for (type of types; track type) { <option [value]="type">{{ type }}</option> }</select>
            </div>
            <div>
              <label for="scheduledStart">Start</label>
              <input id="scheduledStart" type="datetime-local" formControlName="scheduledStart">
            </div>
            <div>
              <label for="scheduledEnd">End</label>
              <input id="scheduledEnd" type="datetime-local" formControlName="scheduledEnd">
            </div>
            <div>
              <label for="customerId">Customer</label>
              <select id="customerId" formControlName="customerId">
                <option value="">Select customer</option>
                @for (customer of customers(); track customer.id) { <option [value]="customer.id">{{ customer.fullName }}</option> }
              </select>
            </div>
            <div>
              <label for="serviceRequestId">Service request</label>
              <select id="serviceRequestId" formControlName="serviceRequestId">
                <option value="">None</option>
                @for (request of serviceRequests(); track request.id) { <option [value]="request.id">{{ request.title }}</option> }
              </select>
            </div>
            <div>
              <label for="projectId">Project</label>
              <select id="projectId" formControlName="projectId">
                <option value="">None</option>
                @for (project of projects(); track project.id) { <option [value]="project.id">{{ project.projectNumber }}</option> }
              </select>
            </div>
            <div>
              <label for="location">Location</label>
              <input id="location" formControlName="location">
              <app-validation-message [control]="appointmentForm.controls.location" label="Location" />
            </div>
            <div class="full">
              <label for="notes">Notes</label>
              <textarea id="notes" formControlName="notes"></textarea>
            </div>
          </div>
          <button class="primary-button" type="submit">{{ editingId() ? 'Update appointment' : 'Schedule appointment' }}</button>
          @if (editingId()) { <button class="primary-button compact muted-button" type="button" (click)="resetForm()">Cancel edit</button> }
        </form>
      }

      <div class="list-stack">
        @for (appointment of appointments(); track appointment.id) {
          <article class="work-card request-card">
            <div>
              <strong>{{ appointment.title }}</strong>
              <p>{{ appointment.type }} · {{ appointment.scheduledStart | date:'medium' }} to {{ appointment.scheduledEnd | date:'shortTime' }}</p>
              <span class="muted">{{ appointment.customerName }} · {{ appointment.location }}</span>
              @if (appointment.serviceRequestTitle) { <p class="muted">Request: {{ appointment.serviceRequestTitle }}</p> }
              @if (appointment.projectNumber) { <p class="muted">Project: {{ appointment.projectNumber }}</p> }
              @if (appointment.notes) { <p>{{ appointment.notes }}</p> }
            </div>
            <div class="status-actions">
              <span class="status-pill">{{ appointment.status }}</span>
              @if (carpenterMode() && (appointment.status === 'SCHEDULED' || appointment.status === 'CONFIRMED')) {
                <button class="text-button dark" type="button" (click)="edit(appointment)">Edit</button>
                <select [value]="appointment.status" (change)="changeStatus(appointment, $any($event.target).value)">
                  @for (status of statuses; track status) { <option [value]="status">{{ status }}</option> }
                </select>
              }
            </div>
          </article>
        } @empty {
          <div class="empty-state"><strong>No appointments yet</strong><span>Scheduled appointments will appear here.</span></div>
        }
      </div>
    </section>
  `
})
export class AppointmentListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly appointmentsApi = inject(AppointmentApiService);
  private readonly customersApi = inject(CustomerApiService);
  private readonly requestsApi = inject(ServiceRequestApiService);
  private readonly projectsApi = inject(ProjectApiService);
  private readonly notifications = inject(NotificationService);
  readonly carpenterMode = signal(false);
  readonly appointments = signal<Appointment[]>([]);
  readonly customers = signal<CustomerProfile[]>([]);
  readonly serviceRequests = signal<ServiceRequest[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly editingId = signal<string | null>(null);
  readonly types: AppointmentType[] = ['SITE_VISIT', 'MEASUREMENT', 'DESIGN_REVIEW', 'INSTALLATION', 'FOLLOW_UP', 'OTHER'];
  readonly statuses: AppointmentStatus[] = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
  readonly appointmentForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    type: ['SITE_VISIT' as AppointmentType, Validators.required],
    scheduledStart: ['', Validators.required],
    scheduledEnd: ['', Validators.required],
    location: ['', [Validators.required, Validators.maxLength(300)]],
    notes: [''],
    customerId: ['', Validators.required],
    serviceRequestId: [''],
    projectId: ['']
  });

  ngOnInit(): void {
    this.carpenterMode.set(this.route.snapshot.data['scope'] === 'carpenter');
    this.load();
  }

  save(): void {
    if (this.appointmentForm.invalid) { this.appointmentForm.markAllAsTouched(); return; }
    const raw = this.appointmentForm.getRawValue();
    const request = { ...raw, serviceRequestId: raw.serviceRequestId || null, projectId: raw.projectId || null };
    const id = this.editingId();
    const action = id ? this.appointmentsApi.update(id, request) : this.appointmentsApi.create(request);
    action.subscribe(appointment => {
      this.upsert(appointment);
      this.resetForm();
      this.notifications.success(id ? 'Appointment updated.' : 'Appointment scheduled.');
    });
  }

  edit(appointment: Appointment): void {
    this.editingId.set(appointment.id);
    this.appointmentForm.reset({
      title: appointment.title,
      type: appointment.type,
      scheduledStart: appointment.scheduledStart.slice(0, 16),
      scheduledEnd: appointment.scheduledEnd.slice(0, 16),
      location: appointment.location,
      notes: appointment.notes,
      customerId: appointment.customerId,
      serviceRequestId: appointment.serviceRequestId ?? '',
      projectId: appointment.projectId ?? ''
    });
  }

  changeStatus(appointment: Appointment, status: AppointmentStatus): void {
    if (appointment.status === status) return;
    this.appointmentsApi.updateStatus(appointment.id, status).subscribe(updated => {
      this.upsert(updated);
      this.notifications.success('Appointment status updated.');
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.appointmentForm.reset({
      title: '',
      type: 'SITE_VISIT',
      scheduledStart: '',
      scheduledEnd: '',
      location: '',
      notes: '',
      customerId: '',
      serviceRequestId: '',
      projectId: ''
    });
  }

  private load(): void {
    const source = this.carpenterMode() ? this.appointmentsApi.all() : this.appointmentsApi.my();
    source.subscribe(page => this.appointments.set(page.content));
    if (this.carpenterMode()) {
      this.customersApi.list().subscribe(page => this.customers.set(page.content));
      this.requestsApi.all().subscribe(page => this.serviceRequests.set(page.content));
      this.projectsApi.all().subscribe(page => this.projects.set(page.content));
    }
  }

  private upsert(appointment: Appointment): void {
    this.appointments.update(items => [appointment, ...items.filter(item => item.id !== appointment.id)]);
  }
}
