import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { SafeGitHubRepo } from '../../core/models/github-repo.model';
import { RepoScore } from '../../core/models/repo-score.model';
import { DashboardStats } from '../../core/models/dashboard-stats.model';
import { RepoSuggestionType } from '../../core/models/repo-suggestion.model';
import { VisibilityAction, VisibilityResult } from '../../core/models/action-result.model';
import { scoreRepo } from '../../core/utils/repo-score.utils';
import { RepoApiService } from '../../core/services/repo-api.service';
import { AiApiService } from '../../core/services/ai-api.service';
import { RepoActionsService } from '../../core/services/repo-actions.service';
import { RepoAnalysisService, SuggestionFilter } from '../../core/services/repo-analysis.service';
import { RepoAiResult } from '../../core/models/repo-ai-result.model';
import { RepoCardComponent } from '../../shared/components/repo-card/repo-card';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state';
import { WarningScreenComponent } from './warning-screen/warning-screen';
import { ResultScreenComponent } from './result-screen/result-screen';

type SortKey = 'updated' | 'stars' | 'forks' | 'name' | 'portfolio' | 'cleanup';
type LoadState = 'loading' | 'loaded' | 'error-offline' | 'error-token' | 'error-ratelimit';
type AiState   = 'idle' | 'loading' | 'done' | 'error';
type ActionState = 'idle' | 'warning' | 'executing' | 'results';

@Component({
  selector: 'app-repos',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    RepoCardComponent,
    StatCardComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    WarningScreenComponent,
    ResultScreenComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="repos-page">

      <section class="repos-page__stats">
        <app-stat-card [value]="stats().total"               label="Total" />
        <app-stat-card [value]="stats().public"              label="Public" />
        <app-stat-card [value]="stats().private"             label="Private" />
        <app-stat-card [value]="stats().archived"            label="Archived" />
        <app-stat-card [value]="stats().forks"               label="Forks" />
        <app-stat-card [value]="stats().portfolioCandidates" label="Portfolio" />
        <app-stat-card [value]="stats().cleanupCandidates"   label="Cleanup" />
      </section>

      <section class="repos-page__controls">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="controls__search">
          <mat-label>Search repos</mat-label>
          <input matInput [value]="searchQuery()" (input)="searchQuery.set($any($event.target).value)" placeholder="Filter by name…" />
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="controls__sort">
          <mat-label>Sort</mat-label>
          <mat-select [value]="sortKey()" (selectionChange)="sortKey.set($event.value)">
            <mat-option value="updated">Recently updated</mat-option>
            <mat-option value="stars">Most stars</mat-option>
            <mat-option value="forks">Most forks</mat-option>
            <mat-option value="name">Name A–Z</mat-option>
            <mat-option value="portfolio">Portfolio score</mat-option>
            <mat-option value="cleanup">Cleanup score</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="controls__filter">
          <mat-label>Filter</mat-label>
          <mat-select [value]="suggestionFilter()" (selectionChange)="suggestionFilter.set($event.value)">
            <mat-option value="all">All repos</mat-option>
            <mat-option value="portfolio_candidate">Portfolio candidates</mat-option>
            <mat-option value="needs_description">Missing description</mat-option>
            <mat-option value="old_experiment">Old &amp; quiet</mat-option>
            <mat-option value="fork_review">Forks</mat-option>
            <mat-option value="already_archived">Archived</mat-option>
            <mat-option value="healthy_repo">Healthy</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-stroked-button (click)="selectAll()">Select all</button>
        <button mat-stroked-button (click)="deselectAll()">Deselect all</button>
        <button mat-stroked-button (click)="refresh()" [disabled]="loadState() === 'loading'">
          <mat-icon>refresh</mat-icon>
        </button>
        <button mat-flat-button color="primary" class="controls__analyse"
          [disabled]="aiState() === 'loading' || loadState() !== 'loaded'"
          (click)="analysePublicRepos()">
          @if (aiState() === 'loading') { Analysing… } @else { Analyse Public Repos }
        </button>
      </section>

      @if (aiState() === 'done') {
        <p class="ai-advisory">
          AI analysis is advisory only. Ratings and suggestions are guides — you make all final decisions.
        </p>
      }
      @if (aiState() === 'error') {
        <p class="ai-advisory ai-advisory--error">AI analysis failed. Check your AI_PROVIDER setting in .env.</p>
      }

      @if (selectedIds().size > 0) {
        <div class="action-bar">
          <span class="action-bar__label">{{ selectedIds().size }} repo{{ selectedIds().size === 1 ? '' : 's' }} selected</span>
          <div class="action-bar__buttons">
            <button mat-stroked-button (click)="initiateAction('private')"
              [disabled]="actionState() === 'executing'">
              <mat-icon>lock</mat-icon> Make Private
            </button>
            <button mat-flat-button color="warn" (click)="initiateAction('public')"
              [disabled]="actionState() === 'executing'">
              <mat-icon>public</mat-icon> Make Public
            </button>
          </div>
        </div>
      }

      @switch (loadState()) {
        @case ('loading') {
          <app-loading-state />
        }
        @case ('error-offline') {
          <app-error-state message="Cannot reach the backend. Make sure npm run dev is running." [showRetry]="true" (retry)="refresh()" />
        }
        @case ('error-token') {
          <app-error-state message="GitHub token missing or invalid. Check your .env file and restart the server." [showRetry]="false" />
        }
        @case ('error-ratelimit') {
          <app-error-state message="GitHub rate limit exceeded. Wait a few minutes and try again." [showRetry]="true" (retry)="refresh()" />
        }
        @default {
          <section class="repos-page__section">
            <h2 class="repos-page__section-title">
              Public <span class="repos-page__count">{{ filteredPublic().length }}</span>
            </h2>
            @if (filteredPublic().length === 0) {
              <app-empty-state message="No public repos match your filter." />
            } @else {
              <div class="repos-page__list">
                @for (repo of filteredPublic(); track repo.id) {
                  <app-repo-card
                    [repo]="repo"
                    [score]="scoreMap()[repo.id] ?? null"
                    [aiResult]="aiResults()[repo.id] ?? null"
                    [selected]="selectedIds().has(repo.id)"
                    [dismissed]="analysis.dismissed().has(repo.id)"
                    (selectionChange)="toggleSelection(repo.id, $event)"
                    (dismiss)="analysis.dismiss(repo.id)"
                    (restore)="analysis.restore(repo.id)"
                  />
                }
              </div>
            }
          </section>

          <section class="repos-page__section">
            <h2 class="repos-page__section-title">
              Private <span class="repos-page__count">{{ filteredPrivate().length }}</span>
            </h2>
            @if (filteredPrivate().length === 0) {
              <app-empty-state message="No private repos match your filter." />
            } @else {
              <div class="repos-page__list">
                @for (repo of filteredPrivate(); track repo.id) {
                  <app-repo-card
                    [repo]="repo"
                    [score]="scoreMap()[repo.id] ?? null"
                    [selected]="selectedIds().has(repo.id)"
                    [dismissed]="analysis.dismissed().has(repo.id)"
                    (selectionChange)="toggleSelection(repo.id, $event)"
                    (dismiss)="analysis.dismiss(repo.id)"
                    (restore)="analysis.restore(repo.id)"
                  />
                }
              </div>
            }
          </section>
        }
      }
    </div>

    @if (actionState() === 'warning') {
      <app-warning-screen
        [repos]="selectedRepos()"
        [action]="pendingAction()!"
        (cancel)="cancelAction()"
        (confirm)="executeAction()"
      />
    }

    @if (actionState() === 'results') {
      <app-result-screen
        [results]="actionResults()"
        (done)="closeResults()"
      />
    }
  `,
  styles: [`
    .repos-page {
      padding: var(--space-6);
      max-width: var(--layout-repos-max-width);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }
    .repos-page__stats { display: flex; gap: var(--space-3); flex-wrap: wrap; }
    .repos-page__controls { display: flex; gap: var(--space-3); align-items: center; flex-wrap: wrap; }
    .controls__search { flex: 1; min-width: var(--controls-search-min-width); }
    .controls__sort   { width: var(--controls-sort-width); }
    .controls__filter { width: var(--controls-sort-width); }
    .controls__analyse { margin-left: auto; white-space: nowrap; }
    .action-bar {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-3) var(--space-5);
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      flex-wrap: wrap;
    }
    .action-bar__label { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--text-primary); flex: 1; }
    .action-bar__buttons { display: flex; gap: var(--space-3); }
    .repos-page__section { display: flex; flex-direction: column; gap: var(--space-3); }
    .repos-page__section-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .repos-page__count { font-size: var(--font-size-sm); color: var(--text-muted); font-weight: var(--font-weight-normal); }
    .repos-page__list { display: flex; flex-direction: column; gap: var(--space-3); }
    .ai-advisory {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
      text-align: center;
      padding: var(--space-2) var(--space-4);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      background: var(--bg-elevated);
    }
    .ai-advisory--error { color: var(--color-danger-fg); border-color: var(--color-danger); background: var(--color-danger-bg); }
  `]
})
export class ReposComponent implements OnInit {
  private readonly api     = inject(RepoApiService);
  private readonly aiApi   = inject(AiApiService);
  private readonly actions = inject(RepoActionsService);
  readonly analysis        = inject(RepoAnalysisService);

  readonly loadState        = signal<LoadState>('loading');
  readonly aiState          = signal<AiState>('idle');
  readonly actionState      = signal<ActionState>('idle');
  readonly repos            = signal<SafeGitHubRepo[]>([]);
  readonly aiResults        = signal<Record<number, RepoAiResult>>({});
  readonly actionResults    = signal<VisibilityResult[]>([]);
  readonly selectedIds      = signal<Set<number>>(new Set());
  readonly searchQuery      = signal('');
  readonly sortKey          = signal<SortKey>('updated');
  readonly suggestionFilter = signal<SuggestionFilter>('all');
  readonly pendingAction    = signal<VisibilityAction | null>(null);

  readonly scoreMap = computed<Record<number, RepoScore>>(() => {
    const map: Record<number, RepoScore> = {};
    for (const repo of this.repos()) map[repo.id] = scoreRepo(repo);
    return map;
  });

  readonly stats = computed<DashboardStats>(() => {
    const all = this.repos();
    const scores = this.scoreMap();
    return {
      total:               all.length,
      public:              all.filter(r => !r.private).length,
      private:             all.filter(r => r.private).length,
      archived:            all.filter(r => r.archived).length,
      forks:               all.filter(r => r.fork).length,
      portfolioCandidates: Object.values(scores).filter(s => s.portfolioScore >= 60).length,
      cleanupCandidates:   Object.values(scores).filter(s => s.cleanupScore >= 40).length,
      missingDescription:  all.filter(r => !r.description).length,
      oldInactive: all.filter(r => {
        const age = Date.now() - new Date(r.updatedAt).getTime();
        return age > 12 * 30 * 24 * 60 * 60 * 1000 && r.stargazersCount === 0;
      }).length,
    };
  });

  readonly selectedRepos = computed<SafeGitHubRepo[]>(() =>
    this.repos().filter(r => this.selectedIds().has(r.id))
  );

  private readonly filteredAndSorted = computed<SafeGitHubRepo[]>(() => {
    const q      = this.searchQuery().toLowerCase().trim();
    const key    = this.sortKey();
    const filter = this.suggestionFilter();
    const scores = this.scoreMap();

    let list = this.repos().filter(r =>
      !q || r.name.toLowerCase().includes(q) || r.fullName.toLowerCase().includes(q)
    );

    if (filter !== 'all') {
      list = list.filter(r =>
        scores[r.id]?.suggestions.some(s => s.type === (filter as RepoSuggestionType))
      );
    }

    return [...list].sort((a, b) => {
      if (key === 'updated')   return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (key === 'stars')     return b.stargazersCount - a.stargazersCount;
      if (key === 'forks')     return b.forksCount - a.forksCount;
      if (key === 'name')      return a.name.localeCompare(b.name);
      if (key === 'portfolio') return (scores[b.id]?.portfolioScore ?? 0) - (scores[a.id]?.portfolioScore ?? 0);
      if (key === 'cleanup')   return (scores[b.id]?.cleanupScore ?? 0) - (scores[a.id]?.cleanupScore ?? 0);
      return 0;
    });
  });

  readonly filteredPublic  = computed(() => this.filteredAndSorted().filter(r => !r.private));
  readonly filteredPrivate = computed(() => this.filteredAndSorted().filter(r => r.private));

  async ngOnInit(): Promise<void> {
    await this.loadRepos();
  }

  async refresh(): Promise<void> {
    this.loadState.set('loading');
    this.repos.set([]);
    this.selectedIds.set(new Set());
    await this.loadRepos();
  }

  private async loadRepos(): Promise<void> {
    try {
      const repos = await this.api.getRepos();
      this.repos.set(repos);
      this.loadState.set('loaded');
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 401)      this.loadState.set('error-token');
      else if (status === 429) this.loadState.set('error-ratelimit');
      else                     this.loadState.set('error-offline');
    }
  }

  toggleSelection(id: number, checked: boolean): void {
    this.selectedIds.update(current => {
      const next = new Set(current);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  }

  async analysePublicRepos(): Promise<void> {
    const publicRepos = this.repos().filter(r => r.private === false);
    if (publicRepos.length === 0) return;
    this.aiState.set('loading');
    try {
      const { results } = await this.aiApi.analyzeRepos(publicRepos);
      const map: Record<number, RepoAiResult> = {};
      for (const r of results) map[r.repoId] = r;
      this.aiResults.set(map);
      this.aiState.set('done');
    } catch {
      this.aiState.set('error');
    }
  }

  initiateAction(action: VisibilityAction): void {
    this.pendingAction.set(action);
    this.actionState.set('warning');
  }

  cancelAction(): void {
    this.pendingAction.set(null);
    this.actionState.set('idle');
  }

  async executeAction(): Promise<void> {
    const action = this.pendingAction();
    if (!action) return;

    const requests = this.selectedRepos().map(r => ({
      fullName: r.fullName,
      visibility: action,
    }));

    this.actionState.set('executing');
    try {
      const { results } = await this.actions.setVisibility(requests);
      this.actionResults.set(results);
    } catch {
      const fallback: VisibilityResult[] = requests.map(r => ({
        fullName: r.fullName,
        visibility: action,
        success: false,
        message: 'Backend unreachable or returned an unexpected error.',
      }));
      this.actionResults.set(fallback);
    }
    this.actionState.set('results');
  }

  async closeResults(): Promise<void> {
    this.actionState.set('idle');
    this.pendingAction.set(null);
    this.selectedIds.set(new Set());
    await this.refresh();
  }

  selectAll(): void   { this.selectedIds.set(new Set(this.filteredAndSorted().map(r => r.id))); }
  deselectAll(): void { this.selectedIds.set(new Set()); }
}
