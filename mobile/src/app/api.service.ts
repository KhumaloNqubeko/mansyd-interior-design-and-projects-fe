import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { apiConfig } from '../api-config';
export class ApiError extends Error { constructor(message: string, readonly status: number) { super(message); } }
@Injectable({ providedIn: 'root' })
export class MobileApi {
  readonly expired = signal(false);
  private csrf: string | null = null;
  private csrfRequest: Promise<void> | null = null;
  reset(): void { this.csrf = null; this.expired.set(false); }
  async refreshCsrf(): Promise<void> {
    if (!this.csrfRequest) this.csrfRequest = this.send<{ token: string }>('/auth/csrf').then(data => { this.csrf = data.token; }).finally(() => { this.csrfRequest = null; });
    return this.csrfRequest;
  }
  async get<T>(path: string): Promise<T> { return this.send<T>(path); }
  async post<T>(path: string, data: unknown = {}): Promise<T> {
    if (path !== '/auth/login' && !this.csrf) await this.refreshCsrf();
    return this.send<T>(path, 'POST', data);
  }
  async blob(path: string): Promise<Blob> { return this.send<Blob>(path, 'GET', undefined, true); }
  private async send<T>(path: string, method = 'GET', data?: unknown, blob = false): Promise<T> {
    if (Capacitor.isNativePlatform() && !apiConfig.baseUrl.startsWith('http')) throw new ApiError('The Android app needs a configured server address. Please contact Mansyd.', 0);
    const form = data instanceof FormData;
    const headers: Record<string, string> = {};
    if (data !== undefined && !form) headers['Content-Type'] = 'application/json';
    if (method !== 'GET' && this.csrf) headers['X-XSRF-TOKEN'] = this.csrf;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const response = await Promise.race([
        fetch(`${apiConfig.baseUrl}${path}`, { method, credentials: 'include', headers, signal: controller.signal,
          body: data === undefined ? undefined : form ? data : JSON.stringify(data) }),
        new Promise<Response>((_resolve, reject) => { timer = setTimeout(() => {
          controller.abort(); reject(new Error('Request timed out'));
        }, 20000); })
      ]);
      if (!response.ok) {
        let message = 'The request could not be completed. Please try again.';
        try { const error = await response.json(); if (typeof error.message === 'string') message = error.message; } catch { /* Non-JSON error */ }
        if (response.status === 401 && !path.startsWith('/auth/')) this.expired.set(true);
        throw new ApiError(message, response.status);
      }
      if (response.status === 204) return undefined as T;
      return (blob ? await response.blob() : await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
    } finally { clearTimeout(timer); }
  }
}
export function errorMessage(error: unknown): string { return error instanceof Error ? error.message : 'Something went wrong. Please try again.'; }
