import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RegistrationComponent } from './registration.component';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';

describe('RegistrationComponent', () => {
  const auth = {
    sendEmailVerification: jasmine.createSpy('sendEmailVerification').and.returnValue(of(void 0)),
    verifyEmailCode: jasmine.createSpy('verifyEmailCode').and.returnValue(of('verified-token')),
    register: jasmine.createSpy('register').and.returnValue(of({}))
  };
  beforeEach(async () => {
    auth.sendEmailVerification.calls.reset();
    auth.verifyEmailCode.calls.reset();
    auth.register.calls.reset();
    await TestBed.configureTestingModule({ imports: [RegistrationComponent], providers: [provideRouter([]), { provide: AuthService, useValue: auth }, { provide: NotificationService, useValue: { success: jasmine.createSpy('success'), error: jasmine.createSpy('error') } }] }).compileComponents();
  });
  it('requires matching strong passwords', () => {
    const component = TestBed.createComponent(RegistrationComponent).componentInstance;
    component.form.patchValue({ password: 'Strong1!', confirmPassword: 'different' });
    expect(component.form.hasError('passwordMismatch')).toBeTrue();
  });
  it('requires a 10-digit cell number and limits passwords to fewer than 12 characters', () => {
    const component = TestBed.createComponent(RegistrationComponent).componentInstance;
    component.form.controls.phoneNumber.setValue('012345678');
    component.form.controls.password.setValue('StrongPass1!');
    expect(component.form.controls.phoneNumber.hasError('pattern')).toBeTrue();
    expect(component.form.controls.password.hasError('maxlength')).toBeTrue();
  });
  it('requires the local cell number to start with zero', () => {
    const component = TestBed.createComponent(RegistrationComponent).componentInstance;
    component.form.controls.phoneNumber.setValue('1825140951');
    expect(component.form.controls.phoneNumber.hasError('pattern')).toBeTrue();
  });
  it('sends the OTP only after the completed form is submitted', () => {
    const component = TestBed.createComponent(RegistrationComponent).componentInstance;
    completeForm(component);

    component.submit();

    expect(auth.sendEmailVerification).toHaveBeenCalledOnceWith('test@example.com', '0123456789');
    expect(component.codeSent()).toBeTrue();
    expect(auth.register).not.toHaveBeenCalled();
  });
  it('creates the account only after the submitted OTP is verified', () => {
    const component = TestBed.createComponent(RegistrationComponent).componentInstance;
    completeForm(component);
    component.submit();
    component.verificationCode.setValue('123456');

    component.submit();

    expect(auth.verifyEmailCode).toHaveBeenCalledOnceWith('test@example.com', '123456');
    expect(auth.register).toHaveBeenCalledWith(jasmine.objectContaining({ emailVerificationToken: 'verified-token' }));
  });
  it('resets OTP entry and sends a new code when the email address changes', () => {
    const component = TestBed.createComponent(RegistrationComponent).componentInstance;
    completeForm(component);
    component.submit();
    component.verificationCode.setValue('123456');

    component.form.controls.email.setValue('different@example.com');
    component.submit();

    expect(component.verificationCode.value).toBe('');
    expect(auth.sendEmailVerification).toHaveBeenCalledWith('different@example.com', '0123456789');
    expect(auth.verifyEmailCode).not.toHaveBeenCalled();
  });
  it('rechecks availability before sending another OTP when the cell number changes', () => {
    const component = TestBed.createComponent(RegistrationComponent).componentInstance;
    completeForm(component);
    component.submit();
    component.verificationCode.setValue('123456');

    component.form.controls.phoneNumber.setValue('0987654321');
    component.submit();

    expect(component.verificationCode.value).toBe('');
    expect(auth.sendEmailVerification).toHaveBeenCalledWith('test@example.com', '0987654321');
    expect(auth.verifyEmailCode).not.toHaveBeenCalled();
  });

  function completeForm(component: RegistrationComponent): void {
    component.form.setValue({
      fullName: 'Test User', email: 'test@example.com', phoneNumber: '0123456789',
      addressLine1: '1 Main Road', addressLine2: '', city: 'Johannesburg', postalCode: '2000',
      password: 'Strong1!', confirmPassword: 'Strong1!'
    });
  }
});
