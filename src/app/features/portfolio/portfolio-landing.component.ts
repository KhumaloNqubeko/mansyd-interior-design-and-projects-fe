import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioApiService } from '../../core/services/portfolio-api.service';

type ShowcaseProject = {
  src: string;
  title: string;
  category: string;
  className: string;
};

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing-page">
      <section class="landing-hero" aria-labelledby="landing-title">
        <div class="landing-copy">
          <p class="eyebrow">Bespoke carpentry & interiors</p>
          <h1 id="landing-title">Spaces made to feel like yours.</h1>
          <p class="landing-intro">
            From fitted kitchens to statement TV walls and clever storage, we design and build thoughtful
            interiors around the way you live.
          </p>
          <div class="landing-actions">
            <a class="landing-primary" routerLink="/register">Start your project <span aria-hidden="true">&#8599;</span></a>
            <a class="landing-secondary" routerLink="/login">Sign in to your project</a>
          </div>
          <div class="landing-proof" aria-label="Service highlights">
            <span><strong>Custom</strong> made</span>
            <span><strong>End-to-end</strong> project care</span>
            <span><strong>Built</strong> to last</span>
          </div>
        </div>

        <a class="landing-feature" routerLink="/login" aria-label="View illuminated kitchen project. Sign in required.">
          <img src="/portfolio/portfolio-06.jpg" alt="Modern fitted kitchen with illuminated cabinetry">
          <span class="feature-number">01 / 11</span>
          <span class="feature-caption">
            <small>Featured project</small>
            <strong>Warm modern kitchen</strong>
            <span>View project &#8594;</span>
          </span>
        </a>
      </section>

      <section class="landing-work" aria-labelledby="work-title">
        <div class="landing-section-heading">
          <div>
            <p class="eyebrow">Selected work</p>
            <h2 id="work-title">Made beautifully. Used every day.</h2>
          </div>
          <p>Select any project to sign in and start planning your own.</p>
        </div>

        <div class="landing-gallery">
          @for (project of projects(); track project.src) {
            <a class="landing-project {{ project.className }}" routerLink="/login"
               [attr.aria-label]="project.title + '. Sign in to continue.'">
              <img [src]="project.src" [alt]="project.title" loading="lazy">
              <span class="project-overlay">
                <small>{{ project.category }}</small>
                <strong>{{ project.title }}</strong>
                <span aria-hidden="true">&#8599;</span>
              </span>
            </a>
          }
        </div>

        <div class="landing-cta">
          <div>
            <p class="eyebrow">Have a space in mind?</p>
            <h2>Let’s make something that fits.</h2>
          </div>
          <div class="landing-actions">
            <a class="landing-primary light" routerLink="/register">Create an account</a>
            <a class="landing-secondary light" routerLink="/login">Already a customer? Sign in</a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class PortfolioLandingComponent implements OnInit {
  private readonly portfolioApi = inject(PortfolioApiService);
  readonly uploadedProjects = signal<ShowcaseProject[]>([]);
  readonly staticProjects: ShowcaseProject[] = [
    { src: '/portfolio/portfolio-03.jpg', title: 'Slatted entertainment wall', category: 'Living space', className: 'project-wide' },
    { src: '/portfolio/portfolio-11.jpg', title: 'Bright fitted kitchen', category: 'Kitchen', className: 'project-tall' },
    { src: '/portfolio/portfolio-08.jpg', title: 'Marble media unit', category: 'Living space', className: '' },
    { src: '/portfolio/portfolio-09.jpg', title: 'Open wardrobe system', category: 'Storage', className: 'project-tall' },
    { src: '/portfolio/portfolio-04.jpg', title: 'Stone-top island', category: 'Kitchen', className: '' },
    { src: '/portfolio/portfolio-10.jpg', title: 'Clean-lined TV wall', category: 'Living space', className: 'project-wide' }
  ];
  readonly projects = computed(() => [...this.uploadedProjects(), ...this.staticProjects]);

  ngOnInit(): void {
    const cardStyles = ['project-wide', 'project-tall', ''];
    this.portfolioApi.all().subscribe(images => this.uploadedProjects.set(images.map((image, index) => ({
      src: this.portfolioApi.contentUrl(image.id),
      title: image.title,
      category: image.category,
      className: cardStyles[index % cardStyles.length]
    }))));
  }
}
