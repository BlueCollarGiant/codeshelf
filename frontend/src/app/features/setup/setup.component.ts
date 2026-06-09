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
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin-bottom: var(--space-4);
    }
    .setup-page__body {
      font-size: var(--font-size-base);
      color: var(--text-secondary);
    }
    code {
      font-size: var(--font-size-sm);
      background: var(--bg-surface);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-family: var(--font-family-mono);
    }
  `]
})
export class SetupComponent {}
