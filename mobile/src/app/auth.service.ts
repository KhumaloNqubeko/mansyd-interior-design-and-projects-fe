import { Injectable, inject, signal } from '@angular/core';
import { MobileApi, ApiError } from './api.service';
import { CustomerSession } from './models';
@Injectable({ providedIn: 'root' })
export class CustomerAuth {
  private readonly api = inject(MobileApi);
  readonly user = signal<CustomerSession | null>(null);
  async restore(): Promise<void> {
    try { const user = await this.api.get<CustomerSession>('/auth/session'); if (user.role === 'CUSTOMER') { this.user.set(user); await this.api.refreshCsrf(); } else { await this.signOut(); } }
    catch { this.user.set(null); this.api.reset(); }
  }
  async signIn(email: string, password: string): Promise<void> {
    this.api.reset();
    const user = await this.api.post<CustomerSession>('/auth/login', { email, password });
    await this.api.refreshCsrf();
    if (user.role !== 'CUSTOMER') { await this.signOut(); throw new ApiError('This app is for customer accounts. Use the website backoffice for business access.', 403); }
    this.user.set(user);
  }
  async signOut(): Promise<void> { await this.api.post('/auth/logout'); this.clear(); }
  clear(): void { this.user.set(null); this.api.reset(); }
}
