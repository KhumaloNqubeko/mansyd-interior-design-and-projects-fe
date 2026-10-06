import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { MobileApi, errorMessage } from './api.service';
@Component({ selector: 'mobile-private-photo', standalone: true, template: `@if (url()) { <img class="activity-photo" [src]="url()" [alt]="description() || 'Shared project photo'"> } @else if (error()) { <p class="error">{{ error() }}</p><button (click)="load()">Retry photo</button> } @else { <p role="status">Loading photo…</p> }` })
export class PrivatePhotoComponent implements OnInit {
  readonly path = input.required<string>(); readonly description = input(''); readonly url = signal(''); readonly error = signal('');
  private readonly api = inject(MobileApi); private destroyed = false;
  constructor() { inject(DestroyRef).onDestroy(() => { this.destroyed = true; if (this.url()) URL.revokeObjectURL(this.url()); }); }
  ngOnInit(): void { void this.load(); }
  async load(): Promise<void> { this.error.set(''); try { const blob = await this.api.blob(this.path()); if (!this.destroyed) { if (this.url()) URL.revokeObjectURL(this.url()); this.url.set(URL.createObjectURL(blob)); } } catch (error) { if (!this.destroyed) this.error.set(errorMessage(error)); } }
}
