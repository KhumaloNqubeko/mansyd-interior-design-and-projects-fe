import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { MobileApi, errorMessage } from './api.service';
import { Page, Project, ProjectActivity, ProjectTimelineEntry } from './models';
import { PrivatePhotoComponent } from './private-photo.component';
@Component({ standalone: true, imports: [DatePipe, FormsModule, RouterLink, IonButton, PrivatePhotoComponent],
  template: `<a class="back-link" routerLink="/customer/projects">← My projects</a>
  @if (loading()) { <p role="status">Loading project…</p> } @else if (loadError()) { <p class="error" role="alert">{{ loadError() }}</p><ion-button (click)="load()">Try again</ion-button> } @else if (project(); as p) {
    <p class="eyebrow">{{ label(p.status) }}</p><h1>{{ p.projectNumber }}</h1><div class="progress" role="progressbar" [attr.aria-valuenow]="p.progress" aria-valuemin="0" aria-valuemax="100" aria-label="Project progress"><span [style.width.%]="p.progress"></span></div>
    <p class="muted">{{ p.progress }}% complete · Planned finish {{ p.plannedCompletionDate || 'to be arranged' }}</p>
    @if (p.notes) { <p>{{ p.notes }}</p> }
    @if (error()) { <p class="error" role="alert">{{ error() }}</p> } @if (success()) { <p class="success" role="status">{{ success() }}</p> }
    @if (p.completionReviewStatus === 'PENDING_REVIEW') {
      <section class="review-card"><p class="eyebrow">Ready for your review</p><h2>How does the finished work look?</h2><p>Confirm you’re happy with the installed work, or describe what needs attention.</p>
        <label for="review-message">Feedback</label><textarea id="review-message" [(ngModel)]="reviewMessage" maxlength="2000" placeholder="Required when reporting an issue"></textarea>
        <label class="check-label"><input type="checkbox" [(ngModel)]="confirmed"> I have reviewed the work and confirm it is complete.</label>
        <ion-button expand="block" [disabled]="busy() || !confirmed" (click)="review(true)">Confirm completed work</ion-button>
        <ion-button expand="block" fill="outline" [disabled]="busy() || !reviewMessage.trim()" (click)="review(false)">Report an issue</ion-button>
      </section>
    } @else if (p.completionReviewStatus === 'CONFIRMED') { <p class="success">Completion confirmed {{ p.customerConfirmedAt | date:'mediumDate' }}.</p> }
    @else if (p.completionReviewStatus === 'ISSUE_REPORTED') { <p class="review-card">Your issue has been sent to Mansyd. You can add supporting photos and comments below.</p> }
    @if (p.status !== 'CANCELLED') {
      <section class="outline-card"><h2>Share an update</h2><form (ngSubmit)="comment()"><label for="comment">Comment</label><textarea id="comment" [(ngModel)]="message" name="comment" maxlength="2000" placeholder="Ask a question or share feedback"></textarea><ion-button type="submit" [disabled]="busy() || !message.trim()">Send comment</ion-button></form>
        <label for="project-photo">Project photo</label><input id="project-photo" type="file" accept="image/jpeg,image/png" (change)="selectPhoto($event)" [disabled]="busy()">
        @if (native) { <ion-button fill="outline" (click)="takePhoto()" [disabled]="busy()">Take photo</ion-button> }
        @if (photo()) { <p class="small">Photo selected · {{ (photo()!.size / 1024).toFixed(0) }} KB</p><label for="photo-description">Photo description (optional)</label><input id="photo-description" [(ngModel)]="description" maxlength="2000"><ion-button (click)="uploadPhoto()" [disabled]="busy()">Upload photo</ion-button><ion-button fill="clear" (click)="clearPhoto()" [disabled]="busy()">Remove</ion-button> }
        <p class="muted small">JPEG or PNG, up to 5 MB. Photos are shared only with Mansyd and your project account.</p>
      </section>
    }
    <h2>Conversation & photos</h2>@for (entry of activity(); track entry.id) { <article class="activity-card"><div class="row"><strong>{{ entry.authorRole === 'CUSTOMER' ? 'You' : 'Mansyd' }}</strong><span class="muted small">{{ entry.createdAt | date:'mediumDate' }}</span></div><span class="eyebrow">{{ label(entry.kind) }}</span>@if (entry.message) { <p class="preserve-lines">{{ entry.message }}</p> }@if (entry.kind === 'PHOTO') { <mobile-private-photo [path]="'/projects/' + p.id + '/activity/' + entry.id + '/photo'" [description]="entry.message" /> }</article> } @empty { <p class="muted">No conversation yet. Send the first update.</p> }
    @if (activityPage() + 1 < activityPages()) { <ion-button fill="outline" (click)="moreActivity()" [disabled]="busy()">Older activity</ion-button> }
    <h2>Project timeline</h2>@for (entry of timeline(); track entry.id) { <article class="activity-card"><strong>{{ entry.title }}</strong><p>{{ entry.message }}</p><span class="small muted">{{ entry.createdAt | date:'medium' }}</span></article> } @empty { <p class="muted">Project updates will appear here.</p> }
    @if (timelinePage() + 1 < timelinePages()) { <ion-button fill="outline" (click)="moreTimeline()" [disabled]="busy()">Older updates</ion-button> }
    <ion-button fill="clear" (click)="load()" [disabled]="busy()">Refresh project</ion-button>
  }` })
export class ProjectDetailPage {
  private readonly api = inject(MobileApi); private readonly route = inject(ActivatedRoute);
  readonly native = Capacitor.isNativePlatform(); readonly id = this.route.snapshot.paramMap.get('id')!;
  readonly project = signal<Project | null>(null); readonly activity = signal<ProjectActivity[]>([]); readonly timeline = signal<ProjectTimelineEntry[]>([]);
  readonly loading = signal(true); readonly loadError = signal(''); readonly error = signal(''); readonly success = signal(''); readonly busy = signal(false); readonly photo = signal<Blob | null>(null);
  readonly activityPage = signal(0); readonly activityPages = signal(0); readonly timelinePage = signal(0); readonly timelinePages = signal(0);
  message = ''; description = ''; reviewMessage = ''; confirmed = false;
  private fileInput: HTMLInputElement | null = null;
  constructor() { void this.load(); }
  label(value: string): string { return value.replaceAll('_', ' ').toLowerCase(); }
  async load(): Promise<void> {
    this.loading.set(true); this.loadError.set(''); try {
      const [project, activity, timeline] = await Promise.all([this.api.get<Project>(`/projects/${this.id}`), this.api.get<Page<ProjectActivity>>(`/projects/${this.id}/activity`), this.api.get<Page<ProjectTimelineEntry>>(`/projects/${this.id}/updates`)]);
      this.project.set(project); this.activity.set(activity.content); this.activityPage.set(0); this.activityPages.set(activity.totalPages); this.timeline.set(timeline.content); this.timelinePage.set(0); this.timelinePages.set(timeline.totalPages);
    } catch (error) { this.loadError.set(errorMessage(error)); } finally { this.loading.set(false); }
  }
  private async action(work: () => Promise<unknown>, success: string): Promise<void> {
    if (this.busy()) return; this.busy.set(true); this.error.set(''); this.success.set('');
    try { await work(); this.success.set(success); await this.load(); } catch (error) { this.error.set(errorMessage(error)); } finally { this.busy.set(false); }
  }
  async comment(): Promise<void> { if (!this.message.trim()) return; await this.action(async () => { await this.api.post(`/projects/${this.id}/comments`, { message: this.message.trim() }); this.message = ''; }, 'Comment sent.'); }
  selectPhoto(event: Event): void { this.fileInput = event.target as HTMLInputElement; const file = this.fileInput.files?.[0]; this.photo.set(null); if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) { this.error.set('Choose a JPEG or PNG photo up to 5 MB.'); this.fileInput.value = ''; return; } this.error.set(''); this.photo.set(file); }
  async takePhoto(): Promise<void> { if (this.busy()) return; this.busy.set(true); this.error.set(''); try {
    const image = await Camera.getPhoto({ source: CameraSource.Camera, resultType: CameraResultType.Uri, quality: 80, width: 1920, correctOrientation: true });
    if (image.webPath) { const blob = await (await fetch(image.webPath)).blob(); if (blob.size > 5 * 1024 * 1024) throw new Error('Photo is too large. Choose a smaller photo.'); this.photo.set(blob); }
  } catch (error) { const message = errorMessage(error); if (!/cancel/i.test(message)) this.error.set(message); } finally { this.busy.set(false); } }
  clearPhoto(): void { this.photo.set(null); this.description = ''; if (this.fileInput) this.fileInput.value = ''; }
  async uploadPhoto(): Promise<void> { const photo = this.photo(); if (!photo) return;
    await this.action(async () => { const form = new FormData(); form.append('file', photo, photo.type === 'image/png' ? 'project-photo.png' : 'project-photo.jpg'); form.append('description', this.description.trim()); await this.api.post(`/projects/${this.id}/photos`, form); this.clearPhoto(); }, 'Photo shared.'); }
  async review(confirmed: boolean): Promise<void> { const project = this.project(); if (!project?.completionReviewId || (confirmed && !this.confirmed) || (!confirmed && !this.reviewMessage.trim())) return;
    await this.action(async () => { await this.api.post(`/projects/${this.id}/completion-review/decision`, { reviewId: project.completionReviewId, confirmed, message: this.reviewMessage.trim() }); this.reviewMessage = ''; this.confirmed = false; }, confirmed ? 'Thank you. Your project is now confirmed complete.' : 'Your issue has been sent to Mansyd.'); }
  async moreActivity(): Promise<void> { await this.paginate('activity'); }
  async moreTimeline(): Promise<void> { await this.paginate('updates'); }
  private async paginate(type: 'activity' | 'updates'): Promise<void> { if (this.busy()) return; this.busy.set(true); this.error.set(''); try {
    if (type === 'activity') { const page = await this.api.get<Page<ProjectActivity>>(`/projects/${this.id}/activity?page=${this.activityPage() + 1}`); this.activity.update(items => [...items, ...page.content.filter(item => !items.some(existing => existing.id === item.id))]); this.activityPage.set(page.page); this.activityPages.set(page.totalPages); }
    else { const page = await this.api.get<Page<ProjectTimelineEntry>>(`/projects/${this.id}/updates?page=${this.timelinePage() + 1}`); this.timeline.update(items => [...items, ...page.content.filter(item => !items.some(existing => existing.id === item.id))]); this.timelinePage.set(page.page); this.timelinePages.set(page.totalPages); }
  } catch (error) { this.error.set(errorMessage(error)); } finally { this.busy.set(false); } }
}
