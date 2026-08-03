import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
@Component({ standalone: true, imports: [AsyncPipe], template: `<section class="dashboard"><p class="eyebrow">Overview</p>@if (auth.currentUser$ | async; as user) { <h1>Good to see you, {{ user.displayName }}</h1><p class="muted">Authentication is ready. The next vertical slice will add your operational dashboard data.</p> }<div class="empty-state"><strong>No activity yet</strong><span>Customer requests, appointments and quotations will appear here as those modules are implemented.</span></div></section>` })
export class DashboardComponent { readonly auth = inject(AuthService); }

