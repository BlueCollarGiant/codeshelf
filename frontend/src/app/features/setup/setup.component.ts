import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { RepoApiService } from '../../core/services/repo-api.service';
import { GitHubStatus } from '../../core/models/github-status.model';
import { GitHubUser } from '../../core/models/github-user.model';

type StatusState = 'loading' | 'ok' | 'error' | 'unknown';

@Component({
  selector: 'app-setup',
  imports: [MatButtonModule, MatDividerModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="setup-page">
      <header class="setup-page__hero">
        <h1 class="setup-page__title">CodeShelf</h1>
        <p class="setup-page__subtitle">Your local GitHub repository review tool.</p>
      </header>

      <section class="setup-page__status">
        <h2 class="setup-page__section-title">Connection Status</h2>

        <div class="status-row">
          <span class="status-indicator" [class]="tokenIndicatorClass()"></span>
          <span class="status-label">GitHub Token</span>
          <span class="status-value">{{ tokenStatusText() }}</span>
        </div>

        @if (user()) {
          <div class="status-row">
            <span class="status-indicator status-indicator--ok"></span>
            <span class="status-label">GitHub User</span>
            <span class="status-value">{{ user()!.name || user()!.login }}</span>
          </div>
        }

        <div class="status-row">
          <span class="status-indicator status-indicator--unknown"></span>
          <span class="status-label">AI Provider</span>
          <span class="status-value">Not configured — optional for Phase 6+</span>
        </div>

        @if (status()?.rateLimitRemaining !== null && status()?.tokenValid) {
          <div class="status-row">
            <span class="status-indicator status-indicator--ok"></span>
            <span class="status-label">Rate Limit</span>
            <span class="status-value">{{ status()!.rateLimitRemaining }} requests remaining</span>
          </div>
        }
      </section>

      <mat-divider />

      <section class="setup-page__instructions">
        <h2 class="setup-page__section-title">Setup</h2>
        <ol class="setup-page__steps">
          <li>
            Copy <code>.env.example</code> to <code>.env</code> in the repo root:
            <pre class="setup-page__code">cp .env.example .env</pre>
          </li>
          <li>
            Create a GitHub Personal Access Token at
            <strong>GitHub → Settings → Developer Settings → Personal access tokens</strong>.
            <br />
            Required permission: <code>Metadata — read-only</code> (fine-grained) or <code>repo</code> (classic).
          </li>
          <li>
            Add your token to <code>.env</code>:
            <pre class="setup-page__code">GITHUB_TOKEN=your_token_here</pre>
          </li>
          <li>Restart the local server: <code>npm run dev</code></li>
        </ol>
      </section>

      <div class="setup-page__cta">
        <a mat-flat-button color="primary" routerLink="/">View Repositories</a>
      </div>
    </main>
  `,
  styles: [`
    .setup-page {
      padding: var(--space-8) var(--space-6);
      max-width: var(--layout-setup-max-width);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }
    .setup-page__hero { text-align: center; }
    .setup-page__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
      margin-bottom: var(--space-2);
    }
    .setup-page__subtitle {
      font-size: var(--font-size-lg);
      color: var(--text-secondary);
    }
    .setup-page__section-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      margin-bottom: var(--space-4);
    }
    .status-row {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--border-subtle);
    }
    .status-indicator {
      width: var(--status-indicator-size);
      height: var(--status-indicator-size);
      border-radius: 50%;
      flex-shrink: 0;
    }
    .status-indicator--ok      { background: var(--color-success); }
    .status-indicator--error   { background: var(--color-danger); }
    .status-indicator--unknown { background: var(--color-neutral-500); }
    .status-indicator--loading { background: var(--color-neutral-500); opacity: 0.5; }
    .status-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      min-width: var(--status-label-min-width);
    }
    .status-value {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
    .setup-page__steps {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      padding-left: var(--space-5);
    }
    .setup-page__steps li {
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
    }
    .setup-page__code {
      margin-top: var(--space-2);
      padding: var(--space-3) var(--space-4);
      background: var(--code-bg);
      color: var(--code-fg);
      border-radius: var(--code-radius);
      font-family: var(--font-family-mono);
      font-size: var(--code-size);
      overflow-x: auto;
    }
    code {
      font-family: var(--font-family-mono);
      font-size: var(--font-size-sm);
      background: var(--bg-elevated);
      padding: var(--code-inline-padding);
      border-radius: var(--radius-sm);
      color: var(--color-blue-300);
    }
    .setup-page__cta { display: flex; justify-content: center; }
  `]
})
export class SetupComponent implements OnInit {
  private readonly api = inject(RepoApiService);

  readonly status = signal<GitHubStatus | null>(null);
  readonly user = signal<GitHubUser | null>(null);
  readonly tokenState = signal<StatusState>('loading');

  readonly tokenIndicatorClass = () => {
    const state = this.tokenState();
    return `status-indicator status-indicator--${state}`;
  };

  readonly tokenStatusText = () => {
    const state = this.tokenState();
    const s = this.status();
    if (state === 'loading') return 'Checking…';
    if (state === 'error')   return 'Backend offline — is npm run dev running?';
    if (!s?.tokenPresent)    return 'Not found — add GITHUB_TOKEN to .env';
    if (!s?.tokenValid)      return 'Invalid or expired — check your token in .env';
    return 'Connected';
  };

  async ngOnInit(): Promise<void> {
    try {
      const s = await this.api.getStatus();
      this.status.set(s);
      this.tokenState.set(s.tokenValid ? 'ok' : s.tokenPresent ? 'error' : 'error');

      if (s.tokenValid) {
        const u = await this.api.getUser();
        this.user.set(u);
      }
    } catch {
      this.tokenState.set('error');
    }
  }
}
