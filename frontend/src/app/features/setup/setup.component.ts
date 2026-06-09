import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-setup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="setup-page">
      <h1 class="setup-page__title">Setup</h1>
      <p class="setup-page__body">Configure your GitHub token and AI provider in <code>.env</code>.</p>
    </main>
  `,
  styles: [`
    .setup-page {
      padding: var(--space-8) var(--space-6);
      max-width: 640px;
      margin: 0 auto;
    }
    .setup-page__title {
      font-size: var(--text-2xl);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--space-4);
    }
    .setup-page__body {
      font-size: var(--text-base);
      color: var(--text-secondary);
    }
    code {
      font-size: var(--text-sm);
      background: var(--surface-card);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      color: var(--text-primary);
    }
  `]
})
export class SetupComponent {}
