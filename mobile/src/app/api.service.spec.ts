import { TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { MobileApi } from './api.service';

describe('Mobile API transport', () => {
  it('releases project screens when the native fetch bridge never settles', fakeAsync(() => {
    fetchSpy.and.returnValue(new Promise(() => {}));
    let message = '';
    void TestBed.inject(MobileApi).get('/projects/my').catch(error => message = error.message);
    tick(20001); flushMicrotasks();
    expect(message).toContain('Check your connection');
  }));
  let fetchSpy: jasmine.Spy;
  beforeEach(() => { TestBed.configureTestingModule({}); fetchSpy = spyOn(window, 'fetch'); });
  it('gets a CSRF token before writes and sends session credentials', async () => {
    fetchSpy.and.callFake((url: string) => Promise.resolve(new Response(JSON.stringify(url.endsWith('/auth/csrf') ? { token: 'test-token' } : { id: 'comment' }), { status: 200, headers: { 'Content-Type': 'application/json' } })));
    await TestBed.inject(MobileApi).post('/projects/1/comments', { message: 'Hello' });
    const request = fetchSpy.calls.mostRecent().args[1]; expect(request.credentials).toBe('include'); expect(request.headers['X-XSRF-TOKEN']).toBe('test-token'); expect(request.body).toBe(JSON.stringify({ message: 'Hello' }));
  });
  it('keeps FormData intact for photo uploads', async () => {
    fetchSpy.and.callFake((url: string) => Promise.resolve(new Response(JSON.stringify(url.endsWith('/auth/csrf') ? { token: 'token' } : {}), { status: 200 })));
    const form = new FormData(); form.append('file', new Blob(['photo']), 'photo.png'); await TestBed.inject(MobileApi).post('/projects/1/photos', form);
    const request = fetchSpy.calls.mostRecent().args[1]; expect(request.body).toBe(form); expect(request.headers['Content-Type']).toBeUndefined();
  });
  it('expires the app session when protected reads return 401', async () => {
    fetchSpy.and.resolveTo(new Response(JSON.stringify({ message: 'Sign in again.' }), { status: 401 }));
    const api = TestBed.inject(MobileApi); await expectAsync(api.get('/projects/my')).toBeRejectedWithError('Sign in again.'); expect(api.expired()).toBeTrue();
  });
  it('does not expire the app session for a failed login', async () => {
    fetchSpy.and.resolveTo(new Response(JSON.stringify({ message: 'Invalid credentials.' }), { status: 401 }));
    const api = TestBed.inject(MobileApi); await expectAsync(api.post('/auth/login', {})).toBeRejected(); expect(api.expired()).toBeFalse();
  });
});
