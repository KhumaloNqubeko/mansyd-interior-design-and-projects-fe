import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CustomerApiService } from '../../core/services/customer-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ValidationMessageComponent } from '../../shared/components/validation-message.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, ValidationMessageComponent],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Customer details</p>
        <h1>My profile</h1>
        <p class="muted">Keep your contact and site details current for visits and quotations.</p>
      </div>

      <form class="work-card" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="form-grid">
          <div><label for="fullName">Full name</label><input id="fullName" formControlName="fullName"><app-validation-message [control]="form.controls.fullName" label="Full name" /></div>
          <div><label for="phoneNumber">Phone number</label><input id="phoneNumber" formControlName="phoneNumber"><app-validation-message [control]="form.controls.phoneNumber" label="Phone number" /></div>
          <div class="full"><label for="addressLine1">Address line 1</label><input id="addressLine1" formControlName="addressLine1"><app-validation-message [control]="form.controls.addressLine1" label="Address" /></div>
          <div class="full"><label for="addressLine2">Address line 2 <span class="optional">(optional)</span></label><input id="addressLine2" formControlName="addressLine2"></div>
          <div><label for="city">City</label><input id="city" formControlName="city"><app-validation-message [control]="form.controls.city" label="City" /></div>
          <div><label for="postalCode">Postal code</label><input id="postalCode" formControlName="postalCode"><app-validation-message [control]="form.controls.postalCode" label="Postal code" /></div>
        </div>
        <button class="primary-button" type="submit" [disabled]="saving()">{{ saving() ? 'Saving...' : 'Save profile' }}</button>
      </form>
    </section>
  `
})
export class CustomerProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly customers = inject(CustomerApiService);
  private readonly notifications = inject(NotificationService);
  readonly saving = signal(false);
  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(30)]],
    addressLine1: ['', [Validators.required, Validators.maxLength(160)]],
    addressLine2: ['', Validators.maxLength(160)],
    city: ['', [Validators.required, Validators.maxLength(100)]],
    postalCode: ['', [Validators.required, Validators.maxLength(20)]]
  });

  ngOnInit(): void {
    this.customers.myProfile().subscribe(profile => this.form.patchValue({
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
      addressLine1: profile.addressLine1,
      addressLine2: profile.addressLine2 ?? '',
      city: profile.city,
      postalCode: profile.postalCode
    }));
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.customers.updateMyProfile(this.form.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe(() => this.notifications.success('Profile updated.'));
  }
}
