import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RegistrationComponent } from './registration.component';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';

describe('RegistrationComponent', () => {
  const auth = { register: jasmine.createSpy('register').and.returnValue(of({})) };
  beforeEach(async () => TestBed.configureTestingModule({ imports: [RegistrationComponent], providers: [provideRouter([]), { provide: AuthService, useValue: auth }, { provide: NotificationService, useValue: { success: jasmine.createSpy('success') } }] }).compileComponents());
  it('requires matching strong passwords', () => {
    const component = TestBed.createComponent(RegistrationComponent).componentInstance;
    component.form.patchValue({ password: 'StrongPassword1!', confirmPassword: 'different' });
    expect(component.form.hasError('passwordMismatch')).toBeTrue();
  });
});

