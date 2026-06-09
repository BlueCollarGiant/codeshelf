import { Component, ChangeDetectionStrategy, signal, computed, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SafeGitHubRepo } from '../../core/models/github-repo.model';
import { RepoScore } from '../../core/models/repo-score.model';
import { DashboardStats } from '../../core/models/dashboard-stats.model';
import { scoreRepo } from '../../core/utils/repo-score.utils';
import { RepoCardComponent } from '../../shared/components/repo-card/repo-card';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { FAKE_REPOS } from '../../../dev/fake-repos';

type SortKey = 'updated' | 'stars' | 'forks' | 'name' | 'portfolio' | 'cleanup';

@Component({
  selector: 'app-repos',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RepoCardComponent,
    StatCardComponent,
    LoadingStateComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="repos-page">

      <!-- Stats bar -->
      <section class="repos-page__stats">
        <app-stat-card [value]="stats().total"               label="Total" />
        <app-stat-card [value]="stats().public"              label="Public" />
        <app-stat-card [value]="stats().private"             label="Private" />
        <app-stat-card [value]="stats().archived"            label="Archived" />
        <app-stat-card [value]="stats().forks"               label="Forks" />
        <app-stat-card [value]="stats().portfolioCandidates" label="Portfolio" />
        <app-stat-card [value]="stats().cleanupCandidates"   label="Cleanup" />
      </section>

      <!-- Controls bar -->
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

        <button mat-stroked-button (click)="selectAll()">Select all</button>
        <button mat-stroked-button (click)="deselectAll()">Deselect all</button>

        <button mat-flat-button color="primary" class="controls__analyse">
          Analyse Public Repos
        </button>
      </section>

      @if (loading()) {
        <app-loading-state />
      } @else {

        <!-- Public section -->
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
                  [selected]="selectedIds().has(repo.id)"
                  (selectionChange)="toggleSelection(repo.id, $event)"
                />
              }
            </div>
          }
        </section>

        <!-- Private section -->
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
                  (selectionChange)="toggleSelection(repo.id, $event)"
                />
              }
            </div>
          }
        </section>

      }
    </div>
  `,
  styles: [`
    .repos-page {
      padding: var(--space-6);
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }
    .repos-page__stats {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
    }
    .repos-page__controls {
      display: flex;
      gap: var(--space-3);
      align-items: center;
      flex-wrap: wrap;
    }
    .controls__search { flex: 1; min-width: 200px; }
    .controls__sort { width: 180px; }
    .controls__analyse { margin-left: auto; white-space: nowrap; }
    .repos-page__section { display: flex; flex-direction: column; gap: var(--space-3); }
    .repos-page__section-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .repos-page__count {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
      font-weight: var(--font-weight-normal);
    }
    .repos-page__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
  `]
})
export class ReposComponent implements OnInit {
  readonly loading = signal(true);
  readonly repos = signal<SafeGitHubRepo[]>([]);
  readonly selectedIds = signal<Set<number>>(new Set());
  readonly searchQuery = signal('');
  readonly sortKey = signal<SortKey>('updated');

  readonly scoreMap = computed<Record<number, RepoScore>>(() => {
    const map: Record<number, RepoScore> = {};
    for (const repo of this.repos()) {
      map[repo.id] = scoreRepo(repo);
    }
    return map;
  });

  readonly stats = computed<DashboardStats>(() => {
    const all = this.repos();
    const scores = this.scoreMap();
    return {
      total: all.length,
      public: all.filter(r => !r.private).length,
      private: all.filter(r => r.private).length,
      archived: all.filter(r => r.archived).length,
      forks: all.filter(r => r.fork).length,
      portfolioCandidates: Object.values(scores).filter(s => s.portfolioScore >= 60).length,
      cleanupCandidates: Object.values(scores).filter(s => s.cleanupScore >= 40).length,
      missingDescription: all.filter(r => !r.description).length,
      oldInactive: all.filter(r => {
        const age = Date.now() - new Date(r.updatedAt).getTime();
        return age > 12 * 30 * 24 * 60 * 60 * 1000 && r.stargazersCount === 0;
      }).length,
    };
  });

  private readonly filteredAndSorted = computed<SafeGitHubRepo[]>(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const key = this.sortKey();
    const scores = this.scoreMap();

    let list = this.repos().filter(r =>
      !q || r.name.toLowerCase().includes(q) || r.fullName.toLowerCase().includes(q)
    );

    return [...list].sort((a, b) => {
      if (key === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (key === 'stars')   return b.stargazersCount - a.stargazersCount;
      if (key === 'forks')   return b.forksCount - a.forksCount;
      if (key === 'name')    return a.name.localeCompare(b.name);
      if (key === 'portfolio') return (scores[b.id]?.portfolioScore ?? 0) - (scores[a.id]?.portfolioScore ?? 0);
      if (key === 'cleanup')   return (scores[b.id]?.cleanupScore ?? 0) - (scores[a.id]?.cleanupScore ?? 0);
      return 0;
    });
  });

  readonly filteredPublic  = computed(() => this.filteredAndSorted().filter(r => !r.private));
  readonly filteredPrivate = computed(() => this.filteredAndSorted().filter(r => r.private));

  ngOnInit(): void {
    setTimeout(() => {
      this.repos.set(FAKE_REPOS);
      this.loading.set(false);
    }, 600);
  }

  toggleSelection(id: number, checked: boolean): void {
    this.selectedIds.update(current => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  selectAll(): void {
    this.selectedIds.set(new Set(this.filteredAndSorted().map(r => r.id)));
  }

  deselectAll(): void {
    this.selectedIds.set(new Set());
  }
}
