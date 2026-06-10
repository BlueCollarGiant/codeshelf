import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { VisibilityAction } from '../../../core/models/action-result.model';
import { SafeGitHubRepo } from '../../../core/models/github-repo.model';

@Component({
  selector: 'app-warning-screen',
  imports: [TitleCasePipe, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="warning-overlay">
      <div class="warning-dialog">
        <div class="warning-dialog__header" [class.warning-dialog__header--public]="action() === 'public'">
          @if (action() === 'public') {
            <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          } @else {
            <svg class="warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          }
          <h2 class="warning-title">
            {{ action() === 'public' ? 'Make Repositories Public' : 'Make Repositories Private' }}
          </h2>
        </div>

        @if (action() === 'public') {
          <div class="warning-banner warning-banner--danger">
            <svg class="warning-banner__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
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
                @if (repo.private) {
                  <svg class="repo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                } @else {
                  <svg class="repo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                }
                <span class="repo-name">{{ repo.fullName }}</span>
                <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <span class="repo-target" [class.repo-target--public]="action() === 'public'">
                  {{ action() }}
                </span>
              </li>
            }
          </ul>

          <p class="warning-disclaimer">
            CodeShelf is not responsible for any resulting loss of data, exposure of sensitive information,
            or access changes. All actions are irreversible through this tool; changes must be undone manually on GitHub.
          </p>
        </div>

        <div class="warning-dialog__actions">
          <button mat-stroked-button (click)="cancel.emit()">Cancel</button>
          <button mat-flat-button
            [color]="action() === 'public' ? 'warn' : 'primary'"
            (click)="confirm.emit()">
            Confirm: Make {{ repos().length }} {{ repos().length === 1 ? 'Repo' : 'Repos' }} {{ action() | titlecase }}
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
    .warning-icon { width: 28px; height: 28px; flex-shrink: 0; color: var(--text-primary); }
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
    .warning-banner__icon { width: 18px; height: 18px; flex-shrink: 0; margin-top: 2px; color: var(--color-danger-fg); }
    .warning-banner p { margin: 0; font-size: var(--font-size-sm); color: var(--text-primary); line-height: var(--leading-relaxed); }
    .warning-body { padding: var(--space-5) var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
    .warning-description { font-size: var(--font-size-base); color: var(--text-secondary); margin: 0; }
    .warning-repo-list {
      list-style: none;
      padding: var(--space-2);
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      max-height: 240px;
      overflow-y: auto;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
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
    .repo-icon { width: 16px; height: 16px; flex-shrink: 0; color: var(--text-muted); }
    .repo-name { flex: 1; font-weight: var(--font-weight-semibold); color: var(--text-primary); word-break: break-all; }
    .arrow-icon { width: 14px; height: 14px; flex-shrink: 0; color: var(--text-muted); }
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
