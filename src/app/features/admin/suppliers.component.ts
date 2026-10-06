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
  template: `<section class="dashboard suppliers-page"><div><p class="eyebrow">Business contacts</p><h1>Suppliers</h1><p class="muted">Maintain supplier details and mark contacts inactive when needed.</p></div>
    <section class="dashboard-panel"><h2>{{ editing() ? 'Edit supplier' : 'Add supplier' }}</h2>
      <form [formGroup]="form" (ngSubmit)="save()" class="admin-form">
        <div class="supplier-fields">
          <div><label for="supplier-name">Business name</label><input id="supplier-name" formControlName="name" maxlength="140"><app-validation-message [control]="form.controls.name" label="Business name" /></div>
          <div><label for="supplier-contact">Contact person</label><input id="supplier-contact" formControlName="contactName" maxlength="160"></div>
          <div><label for="supplier-email">Email</label><input id="supplier-email" type="email" formControlName="email" maxlength="254"><app-validation-message [control]="form.controls.email" label="Email" /></div>
          <div><label for="supplier-phone">Phone</label><input id="supplier-phone" type="tel" formControlName="phoneNumber" maxlength="30"></div>
        </div>
        @if (editing()) { <label class="supplier-check"><input type="checkbox" formControlName="active"><span>Active supplier<small>Available for future work</small></span></label> }
        @if (saveFailed()) { <p role="alert">Supplier could not be saved. Check the details and try again.</p> }
        <div class="supplier-actions"><button type="submit" class="supplier-button supplier-primary" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save supplier' }}</button><button type="button" class="supplier-button" (click)="reset()" [disabled]="saving()">{{ editing() ? 'Cancel edit' : 'Clear form' }}</button></div>
      </form>
    </section>
    @if (loading()) { <p role="status">Loading suppliers…</p> }
    @else if (failed()) { <p role="alert">Suppliers could not be loaded.</p><button class="supplier-button" (click)="load(page())">Try again</button> }
    @else {
      <div class="dashboard-list">@for (supplier of suppliers(); track supplier.id) {
        <article class="client-contact supplier-card"><div class="supplier-details"><div class="supplier-card-heading"><strong>{{ supplier.name }}</strong><span class="supplier-status" [class.inactive]="!supplier.active">{{ supplier.active ? 'Active' : 'Inactive' }}</span></div>@if (supplier.contactName) { <span>{{ supplier.contactName }}</span> }<div class="supplier-contact-details">@if (supplier.email) { <span>{{ supplier.email }}</span> }@if (supplier.phoneNumber) { <span>{{ supplier.phoneNumber }}</span> }</div></div><button type="button" class="supplier-button" (click)="edit(supplier)" [disabled]="saving()">Edit supplier</button></article>
      } @empty { <p class="empty-state">No suppliers yet.</p> }</div>
      <nav class="supplier-pagination" aria-label="Supplier pages"><button class="supplier-button" (click)="load(page() - 1)" [disabled]="page() === 0">Previous</button><span>Page {{ page() + 1 }} of {{ pages() || 1 }}</span><button class="supplier-button" (click)="load(page() + 1)" [disabled]="page() + 1 >= pages()">Next</button></nav>
    }</section>`,
  styles: [`
    .suppliers-page { max-width: 760px; }
    .dashboard-panel { padding: 22px; border-radius: 16px; }
    h2 { margin: 0; font-size: 1.2rem; }
    .admin-form { display: block; margin-top: 18px; }
    .supplier-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 18px; }
    .supplier-fields label { margin: 0 0 6px; font-size: .8rem; }
    .supplier-fields input { min-height: 42px; padding: 10px 12px; }
    .supplier-check { display: flex; align-items: center; gap: 10px; width: fit-content; margin: 18px 0 0; cursor: pointer; }
    .supplier-check input { appearance: none; width: 20px; height: 20px; padding: 0; margin: 0; border: 1.5px solid var(--wood); border-radius: 6px; display: grid; place-content: center; flex-shrink: 0; cursor: pointer; }
    .supplier-check input:checked { background: var(--wood-dark); border-color: var(--wood-dark); }
    .supplier-check input:checked::after { content: ''; width: 5px; height: 9px; border: solid white; border-width: 0 2px 2px 0; transform: translateY(-1px) rotate(45deg); }
    .supplier-check small { display: block; margin-top: 3px; color: var(--muted); font-size: .75rem; font-weight: 400; }
    .supplier-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line); }
    .supplier-button { width: auto; margin: 0; min-height: 40px; padding: 9px 15px; border: 1px solid var(--line); border-radius: 9px; background: var(--paper); color: var(--wood-dark); font-weight: 650; font-size: .82rem; cursor: pointer; white-space: nowrap; }
    .supplier-button:hover:not(:disabled) { background: var(--cream); border-color: var(--wood); }
    .supplier-primary { background: var(--wood-dark); color: white; border-color: var(--wood-dark); }
    .supplier-primary:hover:not(:disabled) { background: var(--wood); }
    .supplier-button:focus-visible, .supplier-check input:focus-visible { outline: 2px solid var(--wood); outline-offset: 3px; }
    .supplier-button:disabled { opacity: .45; cursor: not-allowed; }
    .supplier-card { display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 18px; border-radius: 12px; }
    .supplier-details { display: grid; gap: 5px; min-width: 0; font-size: .85rem; }
    .supplier-card-heading, .supplier-contact-details { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .supplier-contact-details { color: var(--muted); overflow-wrap: anywhere; }
    .supplier-status { padding: 4px 8px; border-radius: 999px; background: var(--cream); color: var(--wood-dark); font-size: .7rem; font-weight: 700; }
    .supplier-status.inactive { color: var(--muted); background: var(--paper); border: 1px solid var(--line); }
    .supplier-pagination { display: flex; align-items: center; gap: 12px; margin-top: 18px; font-size: .8rem; color: var(--muted); }
    @media (max-width: 560px) { .dashboard-panel { padding: 18px; } .supplier-fields { grid-template-columns: 1fr; gap: 14px; } .supplier-card { align-items: flex-start; flex-direction: column; } }
  `]
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
