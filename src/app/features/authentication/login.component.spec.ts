import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  const auth = { login: jasmine.createSpy('login').and.returnValue(of({ id: '1', email: 'a@b.com', role: 'CUSTOMER', displayName: 'A' })) };
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LoginComponent], providers: [provideRouter([]), { provide: AuthService, useValue: auth }, { provide: NotificationService, useValue: { success: jasmine.createSpy('success') } }] }).compileComponents();
    auth.login.calls.reset();
    fixture = TestBed.createComponent(LoginComponent);
  });
  it('does not submit an invalid form', () => { fixture.componentInstance.submit(); expect(auth.login).not.toHaveBeenCalled(); });
  it('submits valid credentials', () => {
    fixture.componentInstance.form.setValue({ email: 'a@b.com', password: 'secret' }); fixture.componentInstance.submit();
    expect(auth.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'secret' });
  });
});
