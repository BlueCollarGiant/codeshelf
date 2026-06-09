import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-state">
      <p class="error-state__title">Something went wrong</p>
      @if (message()) {
        <p class="error-state__message">{{ message() }}</p>
      }
    </div>
  `,
  styles: [`
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-12);
      border: 1px solid var(--color-danger-bg);
      border-radius: var(--radius-lg);
      background: var(--color-danger-bg);
    }
    .error-state__title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-danger-fg);
    }
    .error-state__message {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
  `]
})
export class ErrorStateComponent {
  message = input<string | null>(null);
}
