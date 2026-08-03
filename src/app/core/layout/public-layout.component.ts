import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <main class="public-shell">
      <a class="brand" routerLink="/" aria-label="Carpenter Business Management home">
        <span class="brand-mark" aria-hidden="true">CB</span>
        <span>Carpenter Business</span>
      </a>
      <section class="public-content"><router-outlet /></section>
    </main>
  `
})
export class PublicLayoutComponent { }

