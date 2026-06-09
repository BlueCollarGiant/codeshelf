import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-repos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="repos-page">
      <h1 class="repos-page__title">Your Repositories</h1>
      <p class="repos-page__body">Connect your GitHub token to load repositories.</p>
    </main>
  `,
  styles: [`
    .repos-page {
      padding: var(--space-8) var(--space-6);
      max-width: 960px;
      margin: 0 auto;
    }
    .repos-page__title {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-4);
    }
    .repos-page__body {
      font-size: var(--text-base);
      color: var(--text-secondary);
    }
  `]
})
export class ReposComponent {}
