import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrentUser, LoginRequest, RegistrationRequest, SessionResponse, UserRole } from '../models/auth.models';
import { CsrfTokenStore } from './csrf-token.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly csrfToken = inject(CsrfTokenStore);
  private readonly userState = new BehaviorSubject<CurrentUser | null>(null);
  readonly currentUser$ = this.userState.asObservable();
  readonly isAuthenticated$ = this.currentUser$.pipe(map(user => user !== null));
  readonly currentRole$: Observable<UserRole | null> = this.currentUser$.pipe(map(user => user?.role ?? null));
  private readonly url = `${environment.apiBaseUrl}/auth`;

  get currentUser(): CurrentUser | null { return this.userState.value; }

  loadCsrfToken(): Observable<string> {
    return this.http.get<{ token: string }>(`${this.url}/csrf`).pipe(
      map(response => response.token),
      tap(token => this.csrfToken.set(token))
    );
  }

  login(request: LoginRequest): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${this.url}/login`, request).pipe(tap(user => this.userState.next(user)));
  }

  register(request: RegistrationRequest): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${this.url}/register`, request).pipe(tap(user => this.userState.next(user)));
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.url}/logout`, {}).pipe(tap(() => this.clearSession()));
  }

  loadSession(): Observable<CurrentUser | null> {
    return this.http.get<SessionResponse>(`${this.url}/session`).pipe(
      tap(user => this.userState.next(user)),
      map(user => user as CurrentUser),
      catchError(() => { this.clearSession(); return of(null); })
    );
  }

  clearSession(): void { this.userState.next(null); }
}
