import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ standalone: true, imports: [RouterLink], template: `<div class="auth-card message-card"><p class="eyebrow">403</p><h1>Access denied</h1><p class="muted">Your account does not have permission to view this page.</p><a class="primary-button link-button" routerLink="/">Return home</a></div>` })
export class AccessDeniedComponent { }

