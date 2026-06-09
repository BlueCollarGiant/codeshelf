import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-state',
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="error-state">
      <p class="error-state__title">Something went wrong</p>
      @if (message()) {
        <p class="error-state__message">{{ message() }}</p>
      }
      @if (showRetry()) {
        <button mat-stroked-button (click)="retry.emit()">Try again</button>
      }
    </div>
  `,
  styles: [`
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
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
  message   = input<string | null>(null);
  showRetry = input<boolean>(false);
  retry     = output<void>();
}
