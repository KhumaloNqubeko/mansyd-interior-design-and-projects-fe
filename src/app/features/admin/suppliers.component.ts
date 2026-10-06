import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from '../../core/models/page.model';
import { ValidationMessageComponent } from '../../shared/components/validation-message.component';
interface Supplier { id: string; name: string; contactName: string | null; email: string | null; phoneNumber: string | null; active: boolean; }
@Component({
  standalone: true, imports: [ReactiveFormsModule, ValidationMessageComponent],
  template: `<section class="dashboard"><div><p class="eyebrow">Business contacts</p><h1>Suppliers</h1><p class="muted">Maintain supplier details and mark contacts inactive when needed.</p></div>
    <section class="dashboard-panel"><h2>{{ editing() ? 'Edit supplier' : 'Add supplier' }}</h2>
      <form [formGroup]="form" (ngSubmit)="save()" class="admin-form">
        <label for="supplier-name">Business name</label><input id="supplier-name" formControlName="name" maxlength="140"><app-validation-message [control]="form.controls.name" label="Business name" />
        <label for="supplier-contact">Contact person</label><input id="supplier-contact" formControlName="contactName" maxlength="160">
        <label for="supplier-email">Email</label><input id="supplier-email" type="email" formControlName="email" maxlength="254"><app-validation-message [control]="form.controls.email" label="Email" />
        <label for="supplier-phone">Phone</label><input id="supplier-phone" type="tel" formControlName="phoneNumber" maxlength="30">
        @if (editing()) { <label><input type="checkbox" formControlName="active"> Active supplier</label> }
        @if (saveFailed()) { <p role="alert">Supplier could not be saved. Check the details and try again.</p> }
        <div class="admin-pagination"><button type="submit" class="primary-button" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save supplier' }}</button><button type="button" (click)="reset()" [disabled]="saving()">Cancel / clear</button></div>
      </form>
    </section>
    @if (loading()) { <p role="status">Loading suppliers…</p> }
    @else if (failed()) { <p role="alert">Suppliers could not be loaded.</p><button (click)="load(page())">Try again</button> }
    @else {
      <div class="dashboard-list">@for (supplier of suppliers(); track supplier.id) {
        <article class="client-contact"><strong>{{ supplier.name }} · {{ supplier.active ? 'Active' : 'Inactive' }}</strong><span>{{ supplier.contactName }}</span><span>{{ supplier.email }} {{ supplier.phoneNumber }}</span><button type="button" (click)="edit(supplier)" [disabled]="saving()">Edit supplier</button></article>
      } @empty { <p class="empty-state">No suppliers yet.</p> }</div>
      <nav class="admin-pagination" aria-label="Supplier pages"><button (click)="load(page() - 1)" [disabled]="page() === 0">Previous</button><span>Page {{ page() + 1 }} of {{ pages() || 1 }}</span><button (click)="load(page() + 1)" [disabled]="page() + 1 >= pages()">Next</button></nav>
    }</section>`
})
export class SuppliersComponent {
  private readonly http = inject(HttpClient); private readonly fb = inject(FormBuilder);
  private readonly url = `${environment.apiBaseUrl}/suppliers`;
  readonly suppliers = signal<Supplier[]>([]); readonly editing = signal<string | null>(null);
  readonly loading = signal(false); readonly failed = signal(false); readonly saving = signal(false); readonly saveFailed = signal(false);
  readonly page = signal(0); readonly pages = signal(0);
  readonly form = this.fb.nonNullable.group({ name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(140)]], contactName: ['', Validators.maxLength(160)], email: ['', [Validators.email, Validators.maxLength(254)]], phoneNumber: ['', Validators.maxLength(30)], active: [true] });
  constructor() { this.load(0); }
  load(page: number): void { this.page.set(page); this.loading.set(true); this.failed.set(false);
    this.http.get<PageResponse<Supplier>>(`${this.url}?page=${page}&size=20&sort=name,asc`).pipe(finalize(() => this.loading.set(false))).subscribe({ next: data => { this.suppliers.set(data.content); this.pages.set(data.totalPages); }, error: () => this.failed.set(true) }); }
  edit(supplier: Supplier): void { this.editing.set(supplier.id); this.saveFailed.set(false); this.form.reset({ name: supplier.name, contactName: supplier.contactName ?? '', email: supplier.email ?? '', phoneNumber: supplier.phoneNumber ?? '', active: supplier.active }); }
  reset(): void { this.editing.set(null); this.saveFailed.set(false); this.form.reset({ name: '', contactName: '', email: '', phoneNumber: '', active: true }); }
  save(): void { if (this.saving()) return; if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true); this.saveFailed.set(false); const value = this.form.getRawValue(); const payload = { ...value, name: value.name.trim(), email: value.email.trim() || null, contactName: value.contactName.trim() || null, phoneNumber: value.phoneNumber.trim() || null };
    const request = this.editing() ? this.http.put<Supplier>(`${this.url}/${this.editing()}`, payload) : this.http.post<Supplier>(this.url, payload);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({ next: () => { this.reset(); this.load(this.page()); }, error: () => this.saveFailed.set(true) }); }
}
