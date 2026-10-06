import { Component, computed, input } from '@angular/core';
const paths: Record<string, string> = {
  '': 'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',
  '/profile': 'M20 21v-2a7 7 0 0 0-14 0v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  '/customers': 'M16 21v-2a5 5 0 0 0-10 0v2M11 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M19 4a4 4 0 0 1 0 7M22 21v-2a5 5 0 0 0-3-4',
  '/suppliers': 'M2 5h12v12H2ZM14 9h4l4 4v4h-8M6 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4M18 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4',
  '/requests': 'M14 2H5v20h14V7ZM14 2v5h5M8 14h8M12 10v8',
  '/quotations': 'M5 2h14v20H5ZM8 7h8M8 12h8M8 17h5',
  '/orders': 'M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10M7 4l10 6',
  '/projects': 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
  '/portfolio': 'M3 3h18v18H3ZM3 17l6-6 4 4 3-3 5 5M16 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2',
  '/appointments': 'M3 5h18v16H3ZM7 2v6M17 2v6M3 10h18M7 14h2M12 14h2M7 18h2',
  '/billing': 'M2 4h20v16H2ZM2 9h20M6 15h4',
  '/notifications': 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  '/documents': 'M2 5h8l2 3h10v13H2Z',
  '/audit-logs': 'M5 3h14v18H5ZM8 7h8M8 12l2 2 5-5M8 18h8',
  'menu': 'M3 6h18M3 12h18M3 18h18'
};
@Component({ selector: 'mobile-icon', standalone: true, template: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path [attr.d]="path()" /></svg>` })
export class MobileIcon {
  readonly name = input('');
  readonly path = computed(() => paths[this.name()] ?? paths['/documents']);
}
