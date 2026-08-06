import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <main class="public-shell">
      <header class="public-header">
        <a class="brand" routerLink="/" aria-label="Carpenter Business home">
          <span class="brand-mark" aria-hidden="true">CB</span>
          <span>Carpenter Business</span>
        </a>
        <nav class="public-nav" aria-label="Account navigation">
          <a class="public-login-link" routerLink="/login">Sign in</a>
          <a class="public-register-link" routerLink="/register">Create account</a>
        </nav>
      </header>
      <section class="public-content"><router-outlet /></section>
    </main>
  `
})
export class PublicLayoutComponent { }
