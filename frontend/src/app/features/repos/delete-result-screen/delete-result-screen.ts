import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DeleteResult } from '../../../core/models/action-result.model';

@Component({
  selector: 'app-delete-result-screen',
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="delete-result-overlay">
      <div class="delete-result-dialog">
        <div class="delete-result-dialog__header" [class.header--partial]="failed().length > 0">
          <mat-icon class="result-icon">{{ failed().length === 0 ? 'check_circle' : 'warning' }}</mat-icon>
          <h2 class="result-title">
            {{ failed().length === 0 ? 'Deletion Complete' : 'Deletion Completed with Errors' }}
          </h2>
        </div>

        <div class="result-body">
          <div class="result-summary">
            <span class="result-stat result-stat--deleted">
              <mat-icon>delete</mat-icon> {{ deleted().length }} deleted
            </span>
            @if (failed().length > 0) {
              <span class="result-stat result-stat--failed">
                <mat-icon>close</mat-icon> {{ failed().length }} failed
              </span>
            }
          </div>

          @if (deleted().length > 0) {
            <div class="result-section">
              <h3 class="result-section-title">Deleted</h3>
              <ul class="result-list">
                @for (r of deleted(); track r.fullName) {
                  <li class="result-item result-item--deleted">
                    <mat-icon>delete_forever</mat-icon>
                    <span class="result-name">{{ r.fullName }}</span>
                  </li>
                }
              </ul>
            </div>
          }

          @if (failed().length > 0) {
            <div class="result-section">
              <h3 class="result-section-title">Failed — Still Exists on GitHub</h3>
              <ul class="result-list">
                @for (r of failed(); track r.fullName) {
                  <li class="result-item result-item--failed">
                    <mat-icon>error</mat-icon>
                    <span class="result-name">{{ r.fullName }}</span>
                    <span class="result-error">{{ r.message }}</span>
                  </li>
                }
              </ul>
            </div>
          }
        </div>

        <div class="delete-result-dialog__actions">
          <button mat-flat-button color="primary" (click)="done.emit()">Done</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .delete-result-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
      padding: var(--space-4);
    }
    .delete-result-dialog {
      background: var(--bg-surface);
      border-radius: var(--radius-lg);
      max-width: var(--layout-setup-max-width);
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
    }
    .delete-result-dialog__header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-5) var(--space-6);
      background: var(--color-success-bg, rgba(34,197,94,0.08));
      border-bottom: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    }
    .header--partial { background: var(--color-warning-bg, rgba(245,158,11,0.08)); }
    .result-icon { font-size: var(--font-size-2xl); color: var(--color-success); }
    .header--partial .result-icon { color: var(--color-warning-fg, #f59e0b); }
    .result-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-semibold); color: var(--text-primary); margin: 0; }
    .result-body { padding: var(--space-5) var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
    .result-summary { display: flex; gap: var(--space-4); flex-wrap: wrap; }
    .result-stat { display: flex; align-items: center; gap: var(--space-1); font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); }
    .result-stat mat-icon { font-size: var(--font-size-base); }
    .result-stat--deleted { color: var(--color-danger-fg); }
    .result-stat--failed { color: var(--text-muted); }
    .result-section { display: flex; flex-direction: column; gap: var(--space-2); }
    .result-section-title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-muted); text-transform: uppercase; letter-spacing: var(--tracking-wide); margin: 0; }
    .result-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-1); }
    .result-item { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); font-size: var(--font-size-sm); }
    .result-item--deleted { background: var(--color-danger-bg); }
    .result-item--failed { background: var(--bg-elevated); }
    .result-item mat-icon { font-size: var(--font-size-base); flex-shrink: 0; }
    .result-item--deleted mat-icon { color: var(--color-danger-fg); }
    .result-item--failed mat-icon { color: var(--text-muted); }
    .result-name { flex: 1; font-weight: var(--font-weight-semibold); color: var(--text-primary); word-break: break-all; }
    .result-error { color: var(--color-danger-fg); font-size: var(--font-size-xs); }
    .delete-result-dialog__actions { display: flex; justify-content: flex-end; padding: var(--space-4) var(--space-6); border-top: 1px solid var(--border-subtle); }
  `]
})
export class DeleteResultScreenComponent {
  results = input.required<DeleteResult[]>();
  done    = output<void>();

  readonly deleted = computed(() => this.results().filter(r => r.success));
  readonly failed  = computed(() => this.results().filter(r => !r.success));
}
