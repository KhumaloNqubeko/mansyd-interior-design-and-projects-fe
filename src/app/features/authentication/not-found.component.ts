import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ standalone: true, imports: [RouterLink], template: `<main class="standalone-message"><p class="eyebrow">404</p><h1>Page not found</h1><p>The page may have moved or does not exist.</p><a routerLink="/">Return home</a></main>` })
export class NotFoundComponent { }

