import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { PortfolioApiService } from '../../core/services/portfolio-api.service';
import { NotificationService } from '../../core/services/notification.service';

type PortfolioImage = {
  src: string;
  title: string;
  category: string;
  description: string;
};

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="panel-page portfolio-page">
      <div class="page-heading portfolio-hero">
        <div>
          <p class="eyebrow">Portfolio</p>
          <h1>Carpentry showcase</h1>
          <p class="muted">
            Browse completed fitted kitchens, TV feature walls, storage units and custom interior work.
          </p>
        </div>
        <span class="status-pill">{{ portfolioImages().length }} photos</span>
      </div>

      @if (isCarpenter()) {
        <form class="work-card portfolio-upload" [formGroup]="uploadForm" (ngSubmit)="upload(fileInput)" novalidate>
          <div class="section-kicker">
            <span>Carpenter tools</span>
            <strong>Add work to the showcase</strong>
          </div>
          <div class="portfolio-upload-grid">
            <div>
              <label for="portfolio-title">Project title</label>
              <input id="portfolio-title" formControlName="title" maxlength="160" placeholder="Modern oak kitchen">
            </div>
            <div>
              <label for="portfolio-category">Category</label>
              <input id="portfolio-category" formControlName="category" maxlength="80" placeholder="Kitchen installation">
            </div>
            <div class="full">
              <label for="portfolio-description">Short description</label>
              <textarea id="portfolio-description" formControlName="description" maxlength="500" placeholder="Describe the materials, finish and work completed."></textarea>
            </div>
            <div class="full portfolio-file-field">
              <label for="portfolio-file">Project image</label>
              <input #fileInput id="portfolio-file" type="file" accept="image/jpeg,image/png,image/webp"
                     (change)="selectFile($event)">
              <span class="hint">JPEG, PNG or WebP, up to 10 MB.</span>
            </div>
          </div>
          <button class="primary-button compact" type="submit" [disabled]="uploading()">
            {{ uploading() ? 'Uploading…' : 'Add to showcase' }}
          </button>
        </form>
      }

      <div class="portfolio-browser">
        @for (image of portfolioImages(); track image.src) {
          <button type="button" class="portfolio-browse-card" (click)="selectedImage.set(image)">
            <img [src]="image.src" [alt]="image.title" loading="lazy">
            <span>
              <strong>{{ image.title }}</strong>
              <small>{{ image.category }}</small>
            </span>
          </button>
        }
      </div>
    </section>

    @if (selectedImage(); as image) {
      <section class="portfolio-lightbox" role="dialog" aria-modal="true" aria-label="Portfolio photo preview" (click)="selectedImage.set(null)">
        <article class="portfolio-lightbox-card" (click)="$event.stopPropagation()">
          <button type="button" class="portfolio-close" aria-label="Close photo preview" (click)="selectedImage.set(null)">×</button>
          <img [src]="image.src" [alt]="image.title">
          <div>
            <p class="eyebrow">{{ image.category }}</p>
            <h2>{{ image.title }}</h2>
            <p class="muted">{{ image.description }}</p>
          </div>
        </article>
      </section>
    }
  `
})
export class PortfolioComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly portfolioApi = inject(PortfolioApiService);
  private readonly notifications = inject(NotificationService);
  readonly selectedImage = signal<PortfolioImage | null>(null);
  readonly uploadedImages = signal<PortfolioImage[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly uploading = signal(false);
  readonly isCarpenter = computed(() => this.auth.currentUser?.role === 'CARPENTER');
  readonly uploadForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    category: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', Validators.maxLength(500)]
  });

  readonly staticImages: PortfolioImage[] = [
    {
      src: '/portfolio/portfolio-01.jpg',
      title: 'Kitchen ceiling feature',
      category: 'Kitchen installation',
      description: 'A fitted kitchen detail with wood slats, cabinetry, extractor and dark stone surfaces.'
    },
    {
      src: '/portfolio/portfolio-02.jpg',
      title: 'Modern drawer cabinet',
      category: 'Storage solution',
      description: 'Freestanding storage drawers with a neat pastel finish, black handles and raised metal legs.'
    },
    {
      src: '/portfolio/portfolio-03.jpg',
      title: 'Entertainment feature wall',
      category: 'TV unit',
      description: 'A warm wood TV wall with vertical slats, display shelving and ambient green lighting.'
    },
    {
      src: '/portfolio/portfolio-04.jpg',
      title: 'Fitted kitchen island',
      category: 'Kitchen installation',
      description: 'Custom island cabinetry paired with a glossy stone countertop and clean handle detailing.'
    },
    {
      src: '/portfolio/portfolio-05.jpg',
      title: 'Illuminated TV feature',
      category: 'TV unit',
      description: 'A modern media wall with vertical slats, display shelving, low storage and feature lighting.'
    },
    {
      src: '/portfolio/portfolio-06.jpg',
      title: 'Kitchen with illuminated cabinets',
      category: 'Kitchen installation',
      description: 'Custom upper cabinetry, backsplash lighting and a central island with slatted wood detail.'
    },
    {
      src: '/portfolio/portfolio-07.jpg',
      title: 'Gas hob kitchen island',
      category: 'Kitchen installation',
      description: 'Wood-look cabinetry, black stone tops and a central extractor for a practical family kitchen.'
    },
    {
      src: '/portfolio/portfolio-08.jpg',
      title: 'Marble TV wall unit',
      category: 'TV unit',
      description: 'A fitted wall unit with marble-look panels, side shelves and low storage drawers.'
    },
    {
      src: '/portfolio/portfolio-09.jpg',
      title: 'Open wardrobe storage',
      category: 'Bedroom cabinetry',
      description: 'Built-in wardrobe storage with hanging space, drawers and shelving for practical organisation.'
    },
    {
      src: '/portfolio/portfolio-10.jpg',
      title: 'White TV feature wall',
      category: 'TV unit',
      description: 'A bright TV wall with white panels, vertical slats, storage base and open shelving.'
    },
    {
      src: '/portfolio/portfolio-11.jpg',
      title: 'Modern white kitchen',
      category: 'Kitchen installation',
      description: 'White cabinetry with warm display lighting, marble-look backsplash and a compact fitted layout.'
    }
  ];

  readonly portfolioImages = computed(() => [...this.uploadedImages(), ...this.staticImages]);

  ngOnInit(): void {
    this.portfolioApi.all().subscribe(images => this.uploadedImages.set(images.map(image => ({
      src: this.portfolioApi.contentUrl(image.id),
      title: image.title,
      category: image.category,
      description: image.description
    }))));
  }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.item(0) ?? null);
  }

  upload(fileInput: HTMLInputElement): void {
    if (this.uploadForm.invalid || !this.selectedFile()) {
      this.uploadForm.markAllAsTouched();
      if (!this.selectedFile()) this.notifications.error('Choose an image to upload.');
      return;
    }
    const file = this.selectedFile()!;
    if (file.size > 10 * 1024 * 1024) {
      this.notifications.error('Image size must not exceed 10 MB.');
      return;
    }
    const value = this.uploadForm.getRawValue();
    this.uploading.set(true);
    this.portfolioApi.upload(value.title, value.category, value.description, file)
      .pipe(finalize(() => this.uploading.set(false)))
      .subscribe(image => {
        this.uploadedImages.update(images => [{
          src: this.portfolioApi.contentUrl(image.id), title: image.title,
          category: image.category, description: image.description
        }, ...images]);
        this.uploadForm.reset();
        this.selectedFile.set(null);
        fileInput.value = '';
        this.notifications.success('The project image is now in your showcase.');
      });
  }
}
