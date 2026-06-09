import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { SafeGitHubRepo } from '../../../core/models/github-repo.model';
import { RepoScore } from '../../../core/models/repo-score.model';
import { RepoType } from '../../../core/models/repo-type.model';
import { RepoAiResult } from '../../../core/models/repo-ai-result.model';
import { SuggestionBadgeComponent } from '../suggestion-badge/suggestion-badge';
import { RelativeDatePipe } from '../../pipes/relative-date.pipe';

@Component({
  selector: 'app-repo-card',
  imports: [MatCheckboxModule, MatButtonModule, SuggestionBadgeComponent, RelativeDatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="repo-card" [class.repo-card--selected]="selected()" [class.repo-card--delete]="markedForDelete()">
      <div class="repo-card__rail">
        <mat-checkbox
          [checked]="selected()"
          (change)="selectionChange.emit($event.checked)"
          [aria-label]="'Select ' + repo().name"
        />
        @if (deleteMode()) {
          <mat-checkbox
            class="delete-checkbox"
            color="warn"
            [checked]="markedForDelete()"
            (change)="deleteChange.emit($event.checked)"
            [aria-label]="'Mark ' + repo().name + ' for deletion'"
          />
        }
      </div>

      <div class="repo-card__body">
        <div class="repo-card__header">
          <div class="repo-card__identity">
            <a class="repo-card__name" [href]="repo().htmlUrl" target="_blank" rel="noopener noreferrer">
              {{ repo().fullName }}
            </a>
            @if (repo().description) {
              <p class="repo-card__description">{{ repo().description }}</p>
            } @else {
              <p class="repo-card__description repo-card__description--empty">No description</p>
            }
          </div>

          <div class="repo-card__badges">
            <span class="badge" [class]="visibilityClass()">{{ repo().visibility }}</span>
            @if (repo().archived) {
              <span class="badge badge--archived">archived</span>
            }
            @if (repo().fork) {
              <span class="badge badge--archived">fork</span>
            }
          </div>
        </div>

        <div class="repo-card__meta">
          @if (score(); as s) {
            <span class="repo-card__meta-item repo-card__meta-item--type" [class]="typeChipClass(s.classification.type)">
              {{ s.classification.label }}
            </span>
          }
          @if (repo().language) {
            <span class="repo-card__meta-item repo-card__meta-item--lang">{{ repo().language }}</span>
          }
          @for (topic of repo().topics; track topic) {
            <span class="repo-card__meta-item repo-card__meta-item--topic">{{ topic }}</span>
          }
          <span class="repo-card__meta-item">Stars {{ repo().stargazersCount }}</span>
          <span class="repo-card__meta-item">Forks {{ repo().forksCount }}</span>
          <span class="repo-card__meta-item">Updated {{ repo().updatedAt | relativeDate }}</span>
        </div>

        @if (score(); as s) {
          <div class="repo-card__suggestions">
            <app-suggestion-badge [suggestions]="s.suggestions" />
          </div>
        }

        @if (aiResult(); as ai) {
          <div class="repo-card__ai">
            <div class="ai-scores">
              <span class="chip chip--ai">Skill {{ ai.skillRating }}</span>
              <span class="chip chip--ai">Prof. {{ ai.professionalismRating }}</span>
              @if (ai.suggestDeletion)    { <span class="chip chip--danger">AI: consider deleting</span> }
              @if (ai.suggestMakePrivate) { <span class="chip chip--warn">AI: consider private</span> }
            </div>
            <p class="ai-summary">{{ ai.summary }}</p>
          </div>
        }
      </div>

      @if (score(); as s) {
        <div class="repo-card__scores" aria-label="Repo scores">
          <div class="score-tile score-tile--portfolio">
            <span class="score-tile__label">Portfolio</span>
            <span class="score-tile__value">{{ s.portfolioScore }}</span>
          </div>
          <div class="score-tile score-tile--cleanup">
            <span class="score-tile__label">Cleanup</span>
            <span class="score-tile__value">{{ s.cleanupScore }}</span>
          </div>
          <div class="score-tile score-tile--activity">
            <span class="score-tile__label">Activity</span>
            <span class="score-tile__value">{{ s.activityScore }}</span>
          </div>
          <div class="score-tile score-tile--completeness">
            <span class="score-tile__label">Complete</span>
            <span class="score-tile__value">{{ s.completenessScore }}</span>
          </div>
        </div>
      }
    </article>
  `,
  styles: [`
    .repo-card {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--space-4);
      align-items: stretch;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--card-radius);
      padding: var(--space-4);
      box-shadow: var(--card-shadow);
      transition: border-color var(--duration-fast) var(--ease-default),
                  background var(--duration-fast) var(--ease-default),
                  transform var(--duration-fast) var(--ease-default);
      overflow: hidden;
      min-width: 0;
      position: relative;
    }
    .repo-card:hover {
      background: var(--card-bg-hover);
      border-color: var(--card-border-hover);
      box-shadow: var(--card-shadow-hover);
      transform: translateY(calc(-1 * var(--space-px)));
    }
    .repo-card--selected {
      border-color: var(--color-primary);
      box-shadow: inset var(--space-px) 0 0 var(--color-primary), var(--card-shadow-hover);
    }
    .repo-card--delete {
      border-color: var(--color-danger);
      background: color-mix(in srgb, var(--color-danger-bg) 45%, var(--card-bg));
    }
    .repo-card__rail {
      flex-shrink: 0;
      padding-top: var(--card-checkbox-padding-top);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .delete-checkbox { display: block; }
    .repo-card__body {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .repo-card__header {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      min-width: 0;
    }
    .repo-card__identity {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      min-width: 0;
      flex: 1;
    }
    .repo-card__name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-primary);
      text-decoration: none;
      word-break: break-word;
      line-height: var(--leading-snug);
    }
    .repo-card__name:hover { text-decoration: underline; }
    .repo-card__badges {
      display: flex;
      gap: var(--space-1);
      flex-wrap: wrap;
      margin-left: auto;
      flex-shrink: 0;
      justify-content: flex-end;
    }
    .repo-card__description {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: var(--leading-snug);
      max-width: var(--repo-description-max-width);
    }
    .repo-card__description--empty {
      color: var(--text-muted);
      font-style: italic;
    }
    .repo-card__meta {
      display: flex;
      gap: var(--space-2);
      flex-wrap: wrap;
    }
    .repo-card__meta-item {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      padding: var(--space-1) var(--space-2);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-full);
      background: color-mix(in srgb, var(--bg-inset) 65%, transparent);
    }
    .repo-card__suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
      align-items: center;
    }
    .repo-card__scores {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-2);
      min-width: var(--repo-score-panel-width);
      align-content: start;
    }
    .repo-card__ai {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      padding-top: var(--space-2);
      border-top: 1px solid var(--border-subtle);
    }
    .ai-scores { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .ai-summary {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      line-height: var(--leading-relaxed);
      font-style: italic;
    }
    @media (max-width: 760px) {
      .repo-card {
        grid-template-columns: auto minmax(0, 1fr);
        gap: var(--space-3);
      }
      .repo-card__scores {
        grid-column: 2;
        min-width: 0;
      }
      .repo-card__header {
        flex-direction: column;
      }
      .repo-card__badges {
        margin-left: 0;
        justify-content: flex-start;
      }
    }
  `]
})
export class RepoCardComponent {
  repo            = input.required<SafeGitHubRepo>();
  score           = input<RepoScore | null>(null);
  aiResult        = input<RepoAiResult | null>(null);

  selected        = input<boolean>(false);
  deleteMode      = input<boolean>(false);
  markedForDelete = input<boolean>(false);
  selectionChange = output<boolean>();
  deleteChange    = output<boolean>();

  visibilityClass(): string {
    return `badge badge--${this.repo().visibility}`;
  }

  typeChipClass(type: RepoType): string {
    const accentTypes: Partial<Record<RepoType, string>> = {
      profile_repo:       'type--profile',
      portfolio_project:  'type--portfolio',
      active_project:     'type--active',
      config_or_dotfiles: 'type--config',
      template:           'type--template',
      fork:               'type--fork',
      archived:           'type--archived',
      old_learning_repo:  'type--old',
      experiment:         'type--experiment',
    };
    return accentTypes[type] ?? '';
  }
}
