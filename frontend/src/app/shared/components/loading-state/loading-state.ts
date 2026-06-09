import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loading-state">
      <mat-spinner diameter="40" />
      <p class="loading-state__text">Loading repositories…</p>
    </div>
  `,
  styles: [`
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      padding: var(--space-16);
      color: var(--text-muted);
    }
    .loading-state__text {
      font-size: var(--font-size-base);
      color: var(--text-muted);
    }
  `]
})
export class LoadingStateComponent {}
