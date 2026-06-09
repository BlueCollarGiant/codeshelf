import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

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
          <span class="status-indicator status-indicator--unknown"></span>
          <span class="status-label">GitHub Token</span>
          <span class="status-value">Not connected — add <code>GITHUB_TOKEN</code> to <code>.env</code></span>
        </div>
        <div class="status-row">
          <span class="status-indicator status-indicator--unknown"></span>
          <span class="status-label">AI Provider</span>
          <span class="status-value">Not configured — optional for Phase 6+</span>
        </div>
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
      max-width: 640px;
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
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .status-indicator--ok      { background: var(--color-success); }
    .status-indicator--error   { background: var(--color-danger); }
    .status-indicator--unknown { background: var(--color-neutral-500); }
    .status-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      min-width: 120px;
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
      font-family: var(--code-font);
      font-size: var(--code-size);
      overflow-x: auto;
    }
    code {
      font-family: var(--font-family-mono);
      font-size: var(--font-size-sm);
      background: var(--bg-elevated);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      color: var(--color-blue-300);
    }
    .setup-page__cta { display: flex; justify-content: center; }
  `]
})
export class SetupComponent {}
