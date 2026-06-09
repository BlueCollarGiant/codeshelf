import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SafeGitHubRepo } from '../../../core/models/github-repo.model';

@Component({
  selector: 'app-delete-confirm-screen',
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="delete-overlay">
      <div class="delete-dialog">

        <div class="delete-dialog__header">
          <mat-icon class="delete-icon">delete_forever</mat-icon>
          <div>
            <h2 class="delete-title">Permanent Deletion</h2>
            <p class="delete-subtitle">This action cannot be undone</p>
          </div>
        </div>

        <div class="delete-critical-banner">
          <mat-icon>warning</mat-icon>
          <div class="delete-critical-text">
            <strong>You are about to permanently delete {{ repos().length }} {{ repos().length === 1 ? 'repository' : 'repositories' }}.</strong>
            <p>
              Deleted repositories are <strong>gone forever</strong>. All code, commit history, issues, pull requests,
              releases, and collaborator access will be permanently removed from GitHub with no recovery option.
            </p>
            <p>
              CodeShelf is not responsible for any data loss resulting from this action.
              If you are unsure, click Cancel and review each repository on GitHub before proceeding.
            </p>
          </div>
        </div>

        <div class="delete-body">
          <p class="delete-description">
            The following {{ repos().length === 1 ? 'repository' : 'repositories' }} will be <strong>permanently deleted</strong>:
          </p>

          <ul class="delete-repo-list">
            @for (repo of repos(); track repo.id) {
              <li class="delete-repo-item">
                <mat-icon class="repo-icon">{{ repo.private ? 'lock' : 'public' }}</mat-icon>
                <div class="repo-details">
                  <span class="repo-fullname">{{ repo.fullName }}</span>
                  @if (repo.description) {
                    <span class="repo-desc">{{ repo.description }}</span>
                  }
                </div>
                <span class="repo-stats">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="star-icon" aria-hidden="true"><polygon points="8 2 10.09 6.26 14.73 6.9 11.36 10.14 12.18 14.76 8 12.55 3.82 14.76 4.64 10.14 1.27 6.9 5.91 6.26 8 2"/></svg>
                  {{ repo.stargazersCount }}
                </span>
              </li>
            }
          </ul>

          <div class="delete-disclaimer">
            <mat-icon>info</mat-icon>
            <p>
              Requires <code>delete_repo</code> scope (classic PAT) or Administration read/write (fine-grained PAT).
              If your token lacks this scope, all deletions will fail with a permissions error.
            </p>
          </div>
        </div>

        <div class="delete-dialog__actions">
          <button mat-flat-button color="primary" class="cancel-btn" (click)="cancel.emit()">
            Cancel — Keep All Repos
          </button>
          <button mat-flat-button color="warn" class="confirm-btn" (click)="confirm.emit()">
            <mat-icon>delete_forever</mat-icon>
            Delete {{ repos().length }} {{ repos().length === 1 ? 'Repository' : 'Repositories' }} Permanently
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .delete-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
      padding: var(--space-4);
    }
    .delete-dialog {
      background: var(--bg-surface);
      border: 2px solid var(--color-danger);
      border-radius: var(--radius-lg);
      max-width: var(--layout-setup-max-width);
      width: 100%;
      max-height: 92vh;
      overflow-y: auto;
      box-shadow: 0 0 0 4px rgba(239,68,68,0.15), 0 24px 80px rgba(0,0,0,0.7);
      display: flex;
      flex-direction: column;
    }
    .delete-dialog__header {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-5) var(--space-6);
      background: var(--color-danger);
      border-radius: calc(var(--radius-lg) - 2px) calc(var(--radius-lg) - 2px) 0 0;
    }
    .delete-icon { font-size: 2rem; color: #fff; }
    .delete-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: #fff; margin: 0; }
    .delete-subtitle { font-size: var(--font-size-sm); color: rgba(255,255,255,0.8); margin: var(--space-1) 0 0; }
    .delete-critical-banner {
      display: flex;
      gap: var(--space-4);
      padding: var(--space-5) var(--space-6);
      background: var(--color-danger-bg);
      border-bottom: 1px solid var(--color-danger);
    }
    .delete-critical-banner mat-icon { color: var(--color-danger-fg); flex-shrink: 0; font-size: var(--font-size-xl); margin-top: 2px; }
    .delete-critical-text { display: flex; flex-direction: column; gap: var(--space-2); }
    .delete-critical-text strong { font-size: var(--font-size-base); color: var(--color-danger-fg); }
    .delete-critical-text p { font-size: var(--font-size-sm); color: var(--text-primary); margin: 0; line-height: var(--leading-relaxed); }
    .delete-body { padding: var(--space-5) var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
    .delete-description { font-size: var(--font-size-base); color: var(--text-secondary); margin: 0; }
    .delete-repo-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-height: 220px;
      overflow-y: auto;
      border: 1px solid var(--color-danger);
      border-radius: var(--radius-md);
      padding: var(--space-2);
      background: var(--color-danger-bg);
    }
    .delete-repo-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-3);
      background: var(--bg-surface);
      border-radius: var(--radius-sm);
      border-left: 3px solid var(--color-danger);
    }
    .repo-icon { font-size: var(--font-size-base); color: var(--text-muted); flex-shrink: 0; }
    .repo-details { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .repo-fullname { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); word-break: break-all; }
    .repo-desc { font-size: var(--font-size-xs); color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .repo-stats { display: inline-flex; align-items: center; gap: var(--space-1); font-size: var(--font-size-xs); color: var(--text-muted); flex-shrink: 0; }
    .star-icon { width: 12px; height: 12px; flex-shrink: 0; }
    .delete-disclaimer {
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;
      padding: var(--space-3) var(--space-4);
      background: var(--bg-elevated);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }
    .delete-disclaimer mat-icon { font-size: var(--font-size-base); color: var(--text-muted); flex-shrink: 0; margin-top: 2px; }
    .delete-disclaimer p { font-size: var(--font-size-xs); color: var(--text-muted); margin: 0; line-height: var(--leading-relaxed); }
    .delete-disclaimer code { font-family: var(--font-family-mono); font-size: var(--font-size-xs); background: var(--bg-surface); padding: 1px 4px; border-radius: var(--radius-sm); }
    .delete-dialog__actions {
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-6);
      border-top: 2px solid var(--color-danger);
      flex-wrap: wrap;
    }
    .cancel-btn { flex-shrink: 0; }
    .confirm-btn { flex-shrink: 0; }
  `]
})
export class DeleteConfirmScreenComponent {
  repos   = input.required<SafeGitHubRepo[]>();
  cancel  = output<void>();
  confirm = output<void>();
}
