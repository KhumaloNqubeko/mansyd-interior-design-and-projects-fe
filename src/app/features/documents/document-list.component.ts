import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CustomerProfile } from '../../core/models/customer.models';
import { BusinessDocument, DocumentType } from '../../core/models/document.models';
import { Invoice } from '../../core/models/invoice.models';
import { Project } from '../../core/models/project.models';
import { ServiceRequest } from '../../core/models/service-request.models';
import { CustomerApiService } from '../../core/services/customer-api.service';
import { DocumentApiService } from '../../core/services/document-api.service';
import { InvoiceApiService } from '../../core/services/invoice-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProjectApiService } from '../../core/services/project-api.service';
import { ServiceRequestApiService } from '../../core/services/service-request-api.service';
import { ValidationMessageComponent } from '../../shared/components/validation-message.component';

@Component({
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, ValidationMessageComponent],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Documents</p>
        <h1>{{ carpenterMode() ? 'Document library' : 'My documents' }}</h1>
        <p class="muted">Track designs, contracts, invoices, receipts and customer-visible references.</p>
      </div>

      @if (carpenterMode()) {
        <form class="work-card" [formGroup]="documentForm" (ngSubmit)="save()" novalidate>
          <div class="form-grid">
            <div>
              <label for="title">Title</label>
              <input id="title" formControlName="title">
              <app-validation-message [control]="documentForm.controls.title" label="Title" />
            </div>
            <div>
              <label for="type">Type</label>
              <select id="type" formControlName="type">@for (type of types; track type) { <option [value]="type">{{ type }}</option> }</select>
            </div>
            <div>
              <label for="fileName">File name</label>
              <input id="fileName" formControlName="fileName">
              <app-validation-message [control]="documentForm.controls.fileName" label="File name" />
            </div>
            <div>
              <label for="contentType">Content type</label>
              <input id="contentType" formControlName="contentType" placeholder="application/pdf">
            </div>
            <div>
              <label for="fileSizeBytes">File size bytes</label>
              <input id="fileSizeBytes" type="number" min="0" formControlName="fileSizeBytes">
            </div>
            <div>
              <label for="storageUrl">Storage URL/reference</label>
              <input id="storageUrl" formControlName="storageUrl">
              <app-validation-message [control]="documentForm.controls.storageUrl" label="Storage URL" />
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
              <label for="invoiceId">Invoice</label>
              <select id="invoiceId" formControlName="invoiceId">
                <option value="">None</option>
                @for (invoice of invoices(); track invoice.id) { <option [value]="invoice.id">{{ invoice.invoiceNumber }}</option> }
              </select>
            </div>
            <div>
              <label for="customerVisible">Customer visible</label>
              <select id="customerVisible" formControlName="customerVisible">
                <option [ngValue]="true">Visible to customer</option>
                <option [ngValue]="false">Internal only</option>
              </select>
            </div>
            <div class="full">
              <label for="notes">Notes</label>
              <textarea id="notes" formControlName="notes"></textarea>
            </div>
          </div>
          <button class="primary-button" type="submit">{{ editingId() ? 'Update document' : 'Add document' }}</button>
          @if (editingId()) { <button class="primary-button compact muted-button" type="button" (click)="resetForm()">Cancel edit</button> }
        </form>
      }

      <div class="list-stack">
        @for (document of documents(); track document.id) {
          <article class="work-card request-card">
            <div>
              <strong>{{ document.title }}</strong>
              <p>{{ document.type }} · {{ document.fileName }} · {{ document.contentType }}</p>
              <span class="muted">{{ document.customerName }} · {{ document.createdAt | date:'medium' }}</span>
              @if (document.projectNumber) { <p class="muted">Project: {{ document.projectNumber }}</p> }
              @if (document.invoiceNumber) { <p class="muted">Invoice: {{ document.invoiceNumber }}</p> }
              @if (document.fileSizeBytes !== null && document.fileSizeBytes !== undefined) { <p class="muted">{{ document.fileSizeBytes | number }} bytes</p> }
              @if (document.notes) { <p>{{ document.notes }}</p> }
            </div>
            <div class="status-actions">
              <span class="status-pill">{{ document.status }}</span>
              @if (document.customerVisible) { <span class="status-pill">CUSTOMER</span> }
              @if (document.storageUrl) { <a class="text-button dark" [href]="document.storageUrl" target="_blank" rel="noopener">Open</a> }
              @if (carpenterMode() && document.status === 'ACTIVE') {
                <button class="text-button dark" type="button" (click)="edit(document)">Edit</button>
                <button class="text-button dark" type="button" (click)="archive(document)">Archive</button>
              }
            </div>
          </article>
        } @empty {
          <div class="empty-state"><strong>No documents yet</strong><span>Document references will appear here.</span></div>
        }
      </div>
    </section>
  `
})
export class DocumentListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly documentsApi = inject(DocumentApiService);
  private readonly customersApi = inject(CustomerApiService);
  private readonly requestsApi = inject(ServiceRequestApiService);
  private readonly projectsApi = inject(ProjectApiService);
  private readonly invoicesApi = inject(InvoiceApiService);
  private readonly notifications = inject(NotificationService);
  readonly carpenterMode = signal(false);
  readonly documents = signal<BusinessDocument[]>([]);
  readonly customers = signal<CustomerProfile[]>([]);
  readonly serviceRequests = signal<ServiceRequest[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly invoices = signal<Invoice[]>([]);
  readonly editingId = signal<string | null>(null);
  readonly types: DocumentType[] = ['DESIGN', 'QUOTATION', 'CONTRACT', 'INVOICE', 'RECEIPT', 'PHOTO', 'WARRANTY', 'OTHER'];
  readonly documentForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    type: ['DESIGN' as DocumentType, Validators.required],
    fileName: ['', [Validators.required, Validators.maxLength(180)]],
    contentType: ['application/pdf', [Validators.required, Validators.maxLength(120)]],
    fileSizeBytes: [0, [Validators.min(0)]],
    storageUrl: ['', [Validators.required, Validators.maxLength(500)]],
    notes: [''],
    customerVisible: [true],
    customerId: ['', Validators.required],
    serviceRequestId: [''],
    projectId: [''],
    invoiceId: ['']
  });

  ngOnInit(): void {
    this.carpenterMode.set(this.route.snapshot.data['scope'] === 'carpenter');
    this.load();
  }

  save(): void {
    if (this.documentForm.invalid) { this.documentForm.markAllAsTouched(); return; }
    const raw = this.documentForm.getRawValue();
    const request = {
      ...raw,
      fileSizeBytes: raw.fileSizeBytes || null,
      serviceRequestId: raw.serviceRequestId || null,
      projectId: raw.projectId || null,
      invoiceId: raw.invoiceId || null
    };
    const id = this.editingId();
    const action = id ? this.documentsApi.update(id, request) : this.documentsApi.create(request);
    action.subscribe(document => {
      this.upsert(document);
      this.resetForm();
      this.notifications.success(id ? 'Document updated.' : 'Document added.');
    });
  }

  edit(document: BusinessDocument): void {
    this.editingId.set(document.id);
    this.documentForm.reset({
      title: document.title,
      type: document.type,
      fileName: document.fileName,
      contentType: document.contentType,
      fileSizeBytes: document.fileSizeBytes ?? 0,
      storageUrl: document.storageUrl,
      notes: document.notes,
      customerVisible: document.customerVisible,
      customerId: document.customerId,
      serviceRequestId: document.serviceRequestId ?? '',
      projectId: document.projectId ?? '',
      invoiceId: document.invoiceId ?? ''
    });
  }

  archive(document: BusinessDocument): void {
    this.documentsApi.archive(document.id).subscribe(updated => {
      this.upsert(updated);
      this.notifications.success('Document archived.');
    });
  }

  resetForm(): void {
    this.editingId.set(null);
    this.documentForm.reset({
      title: '',
      type: 'DESIGN',
      fileName: '',
      contentType: 'application/pdf',
      fileSizeBytes: 0,
      storageUrl: '',
      notes: '',
      customerVisible: true,
      customerId: '',
      serviceRequestId: '',
      projectId: '',
      invoiceId: ''
    });
  }

  private load(): void {
    const source = this.carpenterMode() ? this.documentsApi.all() : this.documentsApi.my();
    source.subscribe(page => this.documents.set(page.content));
    if (this.carpenterMode()) {
      this.customersApi.list().subscribe(page => this.customers.set(page.content));
      this.requestsApi.all().subscribe(page => this.serviceRequests.set(page.content));
      this.projectsApi.all().subscribe(page => this.projects.set(page.content));
      this.invoicesApi.all().subscribe(page => this.invoices.set(page.content));
    }
  }

  private upsert(document: BusinessDocument): void {
    this.documents.update(items => [document, ...items.filter(item => item.id !== document.id)]);
  }
}
