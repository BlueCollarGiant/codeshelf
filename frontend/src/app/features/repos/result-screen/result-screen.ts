import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { VisibilityResult } from '../../../core/models/action-result.model';

@Component({
  selector: 'app-result-screen',
  imports: [MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="result-overlay">
      <div class="result-dialog">
        <div class="result-dialog__header">
          @if (allSucceeded()) {
            <svg class="result-icon result-icon--success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          } @else {
            <svg class="result-icon result-icon--partial" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          }
          <h2 class="result-title">
            {{ allSucceeded() ? 'Action Complete' : 'Action Completed with Errors' }}
          </h2>
        </div>

        <div class="result-body">
          <div class="result-summary">
            <span class="result-stat result-stat--success">
              <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              {{ succeeded().length }} succeeded
            </span>
            @if (failed().length > 0) {
              <span class="result-stat result-stat--failure">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                {{ failed().length }} failed
              </span>
            }
          </div>

          @if (succeeded().length > 0) {
            <div class="result-section">
              <h3 class="result-section-title">Changed</h3>
              <ul class="result-list">
                @for (r of succeeded(); track r.fullName) {
                  <li class="result-item result-item--success">
                    <svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span class="result-name">{{ r.fullName }}</span>
                    <span class="result-action">→ {{ r.visibility }}</span>
                  </li>
                }
              </ul>
            </div>
          }

          @if (failed().length > 0) {
            <div class="result-section">
              <h3 class="result-section-title">Failed</h3>
              <ul class="result-list">
                @for (r of failed(); track r.fullName) {
                  <li class="result-item result-item--failure">
                    <svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span class="result-name">{{ r.fullName }}</span>
                    <span class="result-error">{{ r.message }}</span>
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <div class="result-dialog__actions">
          <button mat-flat-button color="primary" (click)="done.emit()">Done</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .result-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
    }
    .result-dialog {
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
    .result-dialog__header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-5) var(--space-6);
      border-bottom: 1px solid var(--border-subtle);
      background: var(--bg-elevated);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }
    .result-icon { width: 28px; height: 28px; flex-shrink: 0; }
    .result-icon--success { color: var(--color-success); }
    .result-icon--partial { color: var(--color-warning-fg, #f59e0b); }
    .result-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      margin: 0;
    }
    .result-body { padding: var(--space-5) var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
    .result-summary { display: flex; gap: var(--space-4); flex-wrap: wrap; }
    .result-stat {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
    }
    .stat-icon { width: 14px; height: 14px; flex-shrink: 0; }
    .result-stat--success { color: var(--color-success); }
    .result-stat--failure { color: var(--color-danger-fg); }
    .result-section { display: flex; flex-direction: column; gap: var(--space-2); }
    .result-section-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      margin: 0;
    }
    .result-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-1); }
    .result-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-sm);
    }
    .item-icon { width: 16px; height: 16px; flex-shrink: 0; }
    .result-item--success { background: var(--color-success-bg, rgba(34,197,94,0.08)); }
    .result-item--success .item-icon { color: var(--color-success); }
    .result-item--failure { background: var(--color-danger-bg); }
    .result-item--failure .item-icon { color: var(--color-danger-fg); }
    .result-name { flex: 1; font-weight: var(--font-weight-semibold); color: var(--text-primary); word-break: break-all; }
    .result-action { color: var(--text-muted); font-size: var(--font-size-xs); }
    .result-error { color: var(--color-danger-fg); font-size: var(--font-size-xs); }
    .result-dialog__actions {
      display: flex;
      justify-content: flex-end;
      padding: var(--space-4) var(--space-6);
      border-top: 1px solid var(--border-subtle);
    }
  `]
})
export class ResultScreenComponent {
  results = input.required<VisibilityResult[]>();
  done    = output<void>();

  readonly succeeded    = computed(() => this.results().filter(r => r.success));
  readonly failed       = computed(() => this.results().filter(r => !r.success));
  readonly allSucceeded = computed(() => this.failed().length === 0);
}
