import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="app-footer">
      <span class="app-footer__text">CodeShelf — localhost only</span>
    </footer>
  `,
  styles: [`
    .app-footer {
      padding: var(--space-4) var(--space-6);
      background: var(--bg-sidebar);
      border-top: 1px solid var(--border-subtle);
      text-align: center;
    }
    .app-footer__text {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }
  `]
})
export class FooterComponent {}
