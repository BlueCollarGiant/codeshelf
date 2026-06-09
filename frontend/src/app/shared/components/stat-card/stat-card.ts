import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stat-card">
      <span class="stat-card__value">{{ value() }}</span>
      <span class="stat-card__label">{{ label() }}</span>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      background: var(--stat-card-bg);
      border: 1px solid var(--stat-card-border);
      border-radius: var(--stat-card-radius);
      padding: var(--stat-card-padding);
      min-width: var(--stat-card-min-width);
    }
    .stat-card__value {
      font-size: var(--stat-number-size);
      font-weight: var(--stat-number-weight);
      color: var(--text-primary);
      line-height: 1;
    }
    .stat-card__label {
      font-size: var(--stat-label-size);
      color: var(--stat-label-color);
    }
  `]
})
export class StatCardComponent {
  value = input.required<number | string>();
  label = input.required<string>();
}
