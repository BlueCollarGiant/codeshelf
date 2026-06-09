import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div class="app-header__brand">
        <a routerLink="/" class="app-header__logo">CodeShelf</a>
      </div>
      <nav class="app-header__nav">
        <a routerLink="/" class="app-header__nav-link">Repos</a>
        <a routerLink="/setup" class="app-header__nav-link">Setup</a>
      </nav>
    </header>
  `,
  styles: [`
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-6);
      height: 56px;
      background: var(--bg-sidebar);
      border-bottom: 1px solid var(--border-subtle);
    }
    .app-header__logo {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      text-decoration: none;
      letter-spacing: var(--tracking-tight);
    }
    .app-header__nav {
      display: flex;
      gap: var(--space-4);
    }
    .app-header__nav-link {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      text-decoration: none;
      transition: color var(--duration-fast) var(--ease-default);
    }
    .app-header__nav-link:hover {
      color: var(--text-primary);
    }
  `]
})
export class HeaderComponent {}
