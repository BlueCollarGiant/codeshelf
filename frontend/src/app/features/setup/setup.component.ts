import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { RepoApiService } from '../../core/services/repo-api.service';
import { AiApiService, AiProviderStatus } from '../../core/services/ai-api.service';
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
          <span class="status-indicator" [class]="aiIndicatorClass()"></span>
          <span class="status-label">AI Provider</span>
          <span class="status-value">{{ aiStatusText() }}</span>
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
            <strong>Install Node.js.</strong> CodeShelf needs Node.js 22.22+ (or 24.15+).
            Download it from
            <a class="setup-page__link" href="https://nodejs.org/en/download" target="_blank" rel="noopener noreferrer">nodejs.org/en/download</a>
            and run the installer; npm is included automatically. Check what you have with:
            <pre class="setup-page__code">node --version</pre>
            Using nvm? Run <code>nvm use</code> inside the repo folder. An <code>.nvmrc</code> is included.
          </li>
          <li>
            <strong>Get the code.</strong> Clone the repo into any folder you keep projects in, then move into it:
            <pre class="setup-page__code">git clone https://github.com/BlueCollarGiant/codeshelf.git
cd codeshelf</pre>
            Every command from here on runs from this <code>codeshelf</code> folder (the repo root, where <code>package.json</code> lives).
          </li>
          <li>
            <strong>Install dependencies.</strong>
            <pre class="setup-page__code">npm run install:all</pre>
            One command installs everything: the root tooling, the Angular frontend, and the Express backend.
            You do not need to install Angular, the Angular CLI, or Express globally; the project carries its own local copies.
          </li>
          <li>
            <strong>Create your environment file.</strong> Copy <code>.env.example</code> to <code>.env</code> in the repo root:
            <pre class="setup-page__code">cp .env.example .env</pre>
          </li>
          <li>
            <strong>Create a GitHub Personal Access Token.</strong> GitHub buries this page, so here is the exact path:
            <ol class="setup-page__substeps">
              <li>Open <a class="setup-page__link" href="https://github.com/settings/profile" target="_blank" rel="noopener noreferrer">github.com/settings/profile</a> (your avatar → <strong>Settings</strong>)</li>
              <li>Scroll the left sidebar to the bottom → <strong>Developer settings</strong></li>
              <li><strong>Personal access tokens</strong> → <strong>Tokens (classic)</strong></li>
              <li><strong>Generate new token</strong> → <strong>Generate new token (classic)</strong></li>
              <li>Check the scopes from the table below, then click <strong>Generate token</strong></li>
              <li>Copy the token immediately. GitHub shows it only once</li>
            </ol>
            Or skip the clicking: these links open the form with scopes pre-selected.
            <ul class="setup-page__substeps">
              <li><a class="setup-page__link" href="https://github.com/settings/tokens/new?description=CodeShelf&amp;scopes=repo" target="_blank" rel="noopener noreferrer">Token for viewing + visibility changes</a> (<code>repo</code>)</li>
              <li><a class="setup-page__link" href="https://github.com/settings/tokens/new?description=CodeShelf&amp;scopes=repo,delete_repo" target="_blank" rel="noopener noreferrer">Token including deletion</a> (<code>repo</code> + <code>delete_repo</code>)</li>
            </ul>
            <table class="setup-page__ai-table">
              <thead>
                <tr>
                  <th>What you want to do</th>
                  <th>Classic scopes</th>
                  <th>Fine-grained permission</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>View and score repos</td>
                  <td><code>repo</code></td>
                  <td>Metadata: Read-only</td>
                </tr>
                <tr>
                  <td>Change visibility</td>
                  <td><code>repo</code></td>
                  <td>Administration: Read/write</td>
                </tr>
                <tr>
                  <td>Delete repos</td>
                  <td><code>repo</code> + <code>delete_repo</code></td>
                  <td>Administration: Read/write</td>
                </tr>
              </tbody>
            </table>
            Prefer a fine-grained token? <a class="setup-page__link" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">Create one here</a>
            with <strong>Repository access: All repositories</strong> and the permissions from the table.
            Note that <code>delete_repo</code> is not included in classic <code>repo</code>; it must be checked separately.
          </li>
          <li>
            <strong>Add your token to <code>.env</code>.</strong> Open the file in any editor and paste the token:
            <pre class="setup-page__code">GITHUB_TOKEN=your_token_here</pre>
          </li>
          <li>
            <strong>Start both servers.</strong>
            <pre class="setup-page__code">npm run dev</pre>
            Angular runs at <code>http://localhost:4200</code> and the Express backend at <code>http://127.0.0.1:3000</code>.
            The backend reads <code>.env</code> once at startup, so restart this command after any <code>.env</code> change.
          </li>
          <li>
            <strong>Optional: Enable AI analysis.</strong>
            Set <code>AI_PROVIDER</code> in <code>.env</code> to one of:
            <table class="setup-page__ai-table">
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Provider</th>
                  <th>Key needed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>openai</code></td>
                  <td>OpenAI (GPT-4o)</td>
                  <td><code>OPENAI_API_KEY</code></td>
                </tr>
                <tr>
                  <td><code>anthropic</code></td>
                  <td>Anthropic (Claude)</td>
                  <td><code>ANTHROPIC_API_KEY</code></td>
                </tr>
                <tr>
                  <td><code>ollama</code></td>
                  <td>Ollama (local, free)</td>
                  <td>None (runs on your machine)</td>
                </tr>
                <tr>
                  <td><code>mock</code></td>
                  <td>Mock (test data)</td>
                  <td>None</td>
                </tr>
              </tbody>
            </table>
            <pre class="setup-page__code">AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_key_here</pre>
            Leave <code>AI_PROVIDER</code> unset to disable AI analysis entirely.
          </li>
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
    .setup-page__substeps {
      margin: var(--space-2) 0 var(--space-3);
      padding-left: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      font-size: var(--font-size-sm);
    }
    .setup-page__substeps li {
      font-size: var(--font-size-sm);
    }
    .setup-page__link {
      color: var(--color-primary);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .setup-page__link:hover {
      color: var(--color-blue-300);
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
    .setup-page__ai-table {
      width: 100%;
      margin-top: var(--space-3);
      margin-bottom: var(--space-3);
      border-collapse: collapse;
      font-size: var(--font-size-sm);
    }
    .setup-page__ai-table th {
      text-align: left;
      padding: var(--space-2) var(--space-3);
      background: var(--bg-elevated);
      color: var(--text-muted);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      border-bottom: 1px solid var(--border-subtle);
    }
    .setup-page__ai-table td {
      padding: var(--space-2) var(--space-3);
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-subtle);
      vertical-align: middle;
    }
    .setup-page__ai-table tr:last-child td { border-bottom: none; }
    .setup-page__ai-table tr:hover td { background: var(--bg-elevated); }
  `]
})
export class SetupComponent implements OnInit {
  private readonly api   = inject(RepoApiService);
  private readonly aiApi = inject(AiApiService);

  readonly status      = signal<GitHubStatus | null>(null);
  readonly user        = signal<GitHubUser | null>(null);
  readonly aiProvider  = signal<AiProviderStatus | null>(null);
  readonly tokenState  = signal<StatusState>('loading');

  readonly tokenIndicatorClass = computed(() => `status-indicator status-indicator--${this.tokenState()}`);

  readonly aiIndicatorClass = computed(() => {
    const ai = this.aiProvider();
    if (!ai) return 'status-indicator status-indicator--loading';
    if (ai.provider === 'none') return 'status-indicator status-indicator--unknown';
    return ai.configured ? 'status-indicator status-indicator--ok' : 'status-indicator status-indicator--error';
  });

  readonly aiStatusText = computed(() => {
    const ai = this.aiProvider();
    if (!ai) return 'Checking…';
    if (ai.provider === 'none') return 'Disabled. Set AI_PROVIDER in .env to enable (optional)';
    if (!ai.configured) return `${ai.provider} selected but API key missing. Add key to .env`;
    if (ai.provider === 'mock') return 'Mock provider active (no API key needed)';
    return `${ai.provider} configured`;
  });

  readonly tokenStatusText = computed(() => {
    const state = this.tokenState();
    const s = this.status();
    if (state === 'loading') return 'Checking…';
    if (state === 'error')   return 'Backend offline. Is npm run dev running?';
    if (!s?.tokenPresent)    return 'Not found. Add GITHUB_TOKEN to .env';
    if (!s?.tokenValid)      return 'Invalid or expired. Check your token in .env';
    return 'Connected';
  });

  async ngOnInit(): Promise<void> {
    // Fetch token status and AI status in parallel
    const [tokenResult, aiResult] = await Promise.allSettled([
      this.api.getStatus(),
      this.aiApi.getStatus(),
    ]);

    if (tokenResult.status === 'fulfilled') {
      const s = tokenResult.value;
      this.status.set(s);
      this.tokenState.set(s.tokenValid ? 'ok' : 'error');
      if (s.tokenValid) {
        const u = await this.api.getUser().catch(() => null);
        if (u) this.user.set(u);
      }
    } else {
      this.tokenState.set('error');
    }

    if (aiResult.status === 'fulfilled') {
      this.aiProvider.set(aiResult.value);
    } else {
      this.aiProvider.set({ provider: 'unknown', configured: false });
    }
  }
}
