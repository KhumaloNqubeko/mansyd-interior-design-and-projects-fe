import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CsrfTokenStore {
  private readonly value = signal<string | null>(null);

  get token(): string | null { return this.value(); }
  set(token: string): void { this.value.set(token); }
  clear(): void { this.value.set(null); }
}
