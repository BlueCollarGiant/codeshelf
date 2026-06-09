import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      <p class="empty-state__message">{{ message() }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-12);
      border: 1px dashed var(--border-subtle);
      border-radius: var(--radius-lg);
    }
    .empty-state__message {
      font-size: var(--font-size-base);
      color: var(--text-muted);
    }
  `]
})
export class EmptyStateComponent {
  message = input<string>('No repositories found.');
}
