import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { VisibilityAction } from '../../../core/models/action-result.model';
import { SafeGitHubRepo } from '../../../core/models/github-repo.model';

@Component({
  selector: 'app-warning-screen',
  imports: [TitleCasePipe, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="warning-overlay">
      <div class="warning-dialog">
        <div class="warning-dialog__header" [class.warning-dialog__header--public]="action() === 'public'">
          <mat-icon class="warning-icon">{{ action() === 'public' ? 'public' : 'lock' }}</mat-icon>
          <h2 class="warning-title">
            {{ action() === 'public' ? 'Make Repositories Public' : 'Make Repositories Private' }}
          </h2>
        </div>

        @if (action() === 'public') {
          <div class="warning-banner warning-banner--danger">
            <mat-icon>warning</mat-icon>
            <p>
              <strong>Making repositories public exposes all code, commit history, and file contents to the internet.</strong>
              Verify that no credentials, API keys, passwords, or sensitive data are committed before proceeding.
            </p>
          </div>
        }

        <div class="warning-body">
          <p class="warning-description">
            The following {{ repos().length }} {{ repos().length === 1 ? 'repository' : 'repositories' }} will be made
            <strong>{{ action() }}</strong>:
          </p>

          <ul class="warning-repo-list">
            @for (repo of repos(); track repo.id) {
              <li class="warning-repo-item">
                <mat-icon class="repo-icon">{{ repo.private ? 'lock' : 'public' }}</mat-icon>
                <span class="repo-name">{{ repo.fullName }}</span>
                <mat-icon class="arrow-icon">arrow_forward</mat-icon>
                <span class="repo-target" [class.repo-target--public]="action() === 'public'">
                  {{ action() }}
                </span>
              </li>
            }
          </ul>

          <p class="warning-disclaimer">
            CodeShelf is not responsible for any resulting loss of data, exposure of sensitive information,
            or access changes. All actions are irreversible through this tool — changes must be undone manually on GitHub.
          </p>
        </div>

        <div class="warning-dialog__actions">
          <button mat-stroked-button (click)="cancel.emit()">Cancel</button>
          <button mat-flat-button
            [color]="action() === 'public' ? 'warn' : 'primary'"
            (click)="confirm.emit()">
            Confirm — Make {{ repos().length }} {{ repos().length === 1 ? 'Repo' : 'Repos' }} {{ action() | titlecase }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .warning-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
    }
    .warning-dialog {
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      max-width: var(--layout-setup-max-width);
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-xl, 0 20px 60px rgba(0,0,0,0.5));
      display: flex;
      flex-direction: column;
    }
    .warning-dialog__header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-elevated);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }
    .warning-dialog__header--public {
      background: var(--color-danger-bg);
      border-color: var(--color-danger);
    }
    .warning-icon { font-size: var(--font-size-2xl); color: var(--text-primary); }
    .warning-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin: 0;
    }
    .warning-banner {
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;
      padding: var(--space-4) var(--space-6);
      border-bottom: 1px solid var(--border-subtle);
    }
    .warning-banner--danger {
      background: var(--color-danger-bg);
      border-color: var(--color-danger);
    }
    .warning-banner mat-icon { color: var(--color-danger-fg); flex-shrink: 0; margin-top: 2px; }
    .warning-banner p { margin: 0; font-size: var(--font-size-sm); color: var(--text-primary); line-height: var(--leading-relaxed); }
    .warning-body { padding: var(--space-5) var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
    .warning-description { font-size: var(--font-size-base); color: var(--text-secondary); margin: 0; }
    .warning-repo-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-height: 240px;
      overflow-y: auto;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: var(--space-2);
    }
    .warning-repo-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: var(--bg-elevated);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
    }
    .repo-icon { font-size: var(--font-size-base); color: var(--text-muted); }
    .repo-name { flex: 1; font-weight: var(--font-weight-semibold); color: var(--text-primary); word-break: break-all; }
    .arrow-icon { font-size: var(--font-size-sm); color: var(--text-muted); }
    .repo-target { font-weight: var(--font-weight-semibold); color: var(--text-muted); }
    .repo-target--public { color: var(--color-danger-fg); }
    .warning-disclaimer {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      border-top: 1px solid var(--border-subtle);
      padding-top: var(--space-4);
      margin: 0;
      line-height: var(--leading-relaxed);
    }
    .warning-dialog__actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--border-subtle);
    }
  `]
})
export class WarningScreenComponent {
  repos   = input.required<SafeGitHubRepo[]>();
  action  = input.required<VisibilityAction>();
  cancel  = output<void>();
  confirm = output<void>();
}
