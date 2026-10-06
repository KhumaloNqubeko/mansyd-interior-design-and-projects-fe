import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonFooter, IonIcon } from '@ionic/angular/standalone';
@Component({ standalone: true, imports: [RouterLink, RouterLinkActive, RouterOutlet, IonContent, IonHeader, IonToolbar, IonTitle, IonFooter, IonIcon],
  template: `<ion-header class="ion-no-border"><ion-toolbar><ion-title>Mansyd <span class="header-detail">Projects</span></ion-title></ion-toolbar></ion-header>
  <ion-content><main class="app-content"><router-outlet /></main></ion-content>
  <ion-footer class="ion-no-border"><nav class="tab-bar" aria-label="Main navigation"><a routerLink="/home" routerLinkActive="active"><ion-icon name="home-outline" aria-hidden="true"/><span>Home</span></a><a routerLink="/projects" routerLinkActive="active"><ion-icon name="albums-outline" aria-hidden="true"/><span>Projects</span></a><a routerLink="/notifications" routerLinkActive="active"><ion-icon name="notifications-outline" aria-hidden="true"/><span>Notifications</span></a><a routerLink="/account" routerLinkActive="active"><ion-icon name="person-outline" aria-hidden="true"/><span>Account</span></a></nav></ion-footer>` })
export class CustomerShell { }
