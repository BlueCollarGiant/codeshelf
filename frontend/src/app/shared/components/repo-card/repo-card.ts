import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { SafeGitHubRepo } from '../../../core/models/github-repo.model';
import { RepoScore } from '../../../core/models/repo-score.model';
import { SuggestionBadgeComponent } from '../suggestion-badge/suggestion-badge';
import { RelativeDatePipe } from '../../pipes/relative-date.pipe';

@Component({
  selector: 'app-repo-card',
  imports: [MatCheckboxModule, MatChipsModule, SuggestionBadgeComponent, RelativeDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="repo-card" [class.repo-card--selected]="selected()">
      <div class="repo-card__checkbox">
        <mat-checkbox
          [checked]="selected()"
          (change)="selectionChange.emit($event.checked)"
          [aria-label]="'Select ' + repo().name"
        />
      </div>

      <div class="repo-card__body">
        <div class="repo-card__header">
          <a class="repo-card__name" [href]="repo().htmlUrl" target="_blank" rel="noopener noreferrer">
            {{ repo().fullName }}
          </a>
          <div class="repo-card__badges">
            <span class="badge" [class]="visibilityClass()">{{ repo().visibility }}</span>
            @if (repo().archived) {
              <span class="badge badge--info">archived</span>
            }
            @if (repo().fork) {
              <span class="badge badge--info">fork</span>
            }
          </div>
        </div>

        @if (repo().description) {
          <p class="repo-card__description">{{ repo().description }}</p>
        } @else {
          <p class="repo-card__description repo-card__description--empty">No description</p>
        }

        <div class="repo-card__meta">
          @if (repo().language) {
            <span class="repo-card__meta-item">{{ repo().language }}</span>
          }
          <span class="repo-card__meta-item">⭐ {{ repo().stargazersCount }}</span>
          <span class="repo-card__meta-item">🍴 {{ repo().forksCount }}</span>
          <span class="repo-card__meta-item">Updated {{ repo().updatedAt | relativeDate }}</span>
        </div>

        @if (score(); as s) {
          <div class="repo-card__suggestions">
            <app-suggestion-badge [suggestions]="s.suggestions" />
          </div>
          <div class="repo-card__scores">
            <span class="chip">Portfolio {{ s.portfolioScore }}</span>
            <span class="chip">Cleanup {{ s.cleanupScore }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .repo-card {
      display: flex;
      gap: var(--space-3);
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--card-radius);
      padding: var(--card-padding);
      box-shadow: var(--card-shadow);
      transition: border-color var(--duration-fast) var(--ease-default),
                  background var(--duration-fast) var(--ease-default);
    }
    .repo-card:hover {
      background: var(--card-bg-hover);
      border-color: var(--card-border-hover);
      box-shadow: var(--card-shadow-hover);
    }
    .repo-card--selected {
      border-color: var(--color-primary);
    }
    .repo-card__checkbox {
      flex-shrink: 0;
      padding-top: 2px;
    }
    .repo-card__body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .repo-card__header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .repo-card__name {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--color-primary);
      text-decoration: none;
      word-break: break-word;
    }
    .repo-card__name:hover { text-decoration: underline; }
    .repo-card__badges {
      display: flex;
      gap: var(--space-1);
      flex-wrap: wrap;
      margin-left: auto;
    }
    .repo-card__description {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: var(--leading-snug);
    }
    .repo-card__description--empty {
      color: var(--text-muted);
      font-style: italic;
    }
    .repo-card__meta {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .repo-card__meta-item {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }
    .repo-card__suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
    }
    .repo-card__scores {
      display: flex;
      gap: var(--space-2);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 2px var(--space-2);
      border-radius: var(--badge-radius);
      font-size: var(--badge-font-size);
      font-weight: var(--badge-font-weight);
      letter-spacing: var(--badge-tracking);
      text-transform: uppercase;
      line-height: 1;
    }
    .badge--public   { background: var(--badge-public-bg);   color: var(--badge-public-fg); }
    .badge--private  { background: var(--badge-private-bg);  color: var(--badge-private-fg); }
    .badge--internal { background: var(--badge-private-bg);  color: var(--badge-private-fg); }
    .badge--info     { background: var(--badge-archived-bg); color: var(--badge-archived-fg); }
    .chip {
      display: inline-flex;
      align-items: center;
      padding: var(--chip-padding-y) var(--chip-padding-x);
      background: var(--chip-bg);
      border: 1px solid var(--chip-border);
      border-radius: var(--chip-radius);
      font-size: var(--chip-font-size);
      font-weight: var(--chip-font-weight);
      color: var(--text-secondary);
    }
  `]
})
export class RepoCardComponent {
  repo = input.required<SafeGitHubRepo>();
  score = input<RepoScore | null>(null);
  selected = input<boolean>(false);
  selectionChange = output<boolean>();

  visibilityClass(): string {
    return `badge badge--${this.repo().visibility}`;
  }
}
