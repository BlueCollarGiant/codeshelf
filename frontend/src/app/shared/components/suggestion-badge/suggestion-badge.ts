import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RepoSuggestion } from '../../../core/models/repo-suggestion.model';

@Component({
  selector: 'app-suggestion-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (s of suggestions(); track s.type) {
      <span class="badge badge--{{ s.severity }}" [title]="s.reason">{{ s.label }}</span>
    }
  `,
  styles: [`
    :host { display: flex; flex-wrap: wrap; gap: var(--space-1); }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: var(--badge-padding-y) var(--space-2);
      border-radius: var(--badge-radius);
      font-size: var(--badge-font-size);
      font-weight: var(--badge-font-weight);
      letter-spacing: var(--badge-tracking);
      text-transform: uppercase;
      line-height: 1;
    }
    .badge--success  { background: var(--color-success-bg);  color: var(--color-success-fg); }
    .badge--info     { background: var(--color-info-bg);     color: var(--color-info-fg); }
    .badge--warning  { background: var(--color-warning-bg);  color: var(--color-warning-fg); }
    .badge--danger   { background: var(--color-danger-bg);   color: var(--color-danger-fg); }
  `]
})
export class SuggestionBadgeComponent {
  suggestions = input.required<RepoSuggestion[]>();
}
