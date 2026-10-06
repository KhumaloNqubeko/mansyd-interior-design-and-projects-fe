import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
@Component({ selector: 'app-project-photo', standalone: true, template: `@if (url()) { <img [src]="url()" [alt]="description() || 'Project photo'" style="width:100%;max-height:360px;object-fit:contain;border-radius:12px"> } @else if (failed()) { <p>Photo could not be loaded.</p><button (click)="load()">Retry</button> } @else { <p role="status">Loading photo…</p> }` })
export class ProjectPhotoComponent implements OnInit {
  readonly source = input.required<string>(); readonly description = input(''); readonly url = signal(''); readonly failed = signal(false);
  private readonly http = inject(HttpClient); private destroyed = false;
  constructor() { inject(DestroyRef).onDestroy(() => { this.destroyed = true; if (this.url()) URL.revokeObjectURL(this.url()); }); }
  ngOnInit(): void { this.load(); }
  load(): void { this.failed.set(false); this.http.get(this.source(), { responseType: 'blob' }).subscribe({ next: blob => { if (!this.destroyed) { if (this.url()) URL.revokeObjectURL(this.url()); this.url.set(URL.createObjectURL(blob)); } }, error: () => this.failed.set(true) }); }
}
