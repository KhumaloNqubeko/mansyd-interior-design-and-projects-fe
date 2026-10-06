import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
@Component({ standalone: true, imports: [RouterLink, RouterOutlet], template: `
  <main class="public-shell mobile-public">
    <header class="public-header"><a class="brand" routerLink="/"><span class="brand-mark">M</span>Mansyd</a>
      <nav class="public-nav" aria-label="Account navigation"><a routerLink="/login">Sign in</a><a class="public-register-link" routerLink="/register">Join</a></nav>
    </header><section class="public-content"><router-outlet /></section>
  </main>` })
export class MobilePublicShell {}
