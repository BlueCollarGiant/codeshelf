import { Injectable, signal } from '@angular/core';
import { RepoSuggestionType } from '../models/repo-suggestion.model';

const STORAGE_KEY = 'codeshelf:dismissed';

@Injectable({ providedIn: 'root' })
export class RepoAnalysisService {
  private readonly _dismissed = signal<Set<number>>(this.loadDismissed());

  readonly dismissed = this._dismissed.asReadonly();

  dismiss(repoId: number): void {
    this._dismissed.update(current => {
      const next = new Set(current);
      next.add(repoId);
      this.persist(next);
      return next;
    });
  }

  restore(repoId: number): void {
    this._dismissed.update(current => {
      const next = new Set(current);
      next.delete(repoId);
      this.persist(next);
      return next;
    });
  }

  isDismissed(repoId: number): boolean {
    return this._dismissed().has(repoId);
  }

  private loadDismissed(): Set<number> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set();
      const ids: number[] = JSON.parse(raw);
      return new Set(ids);
    } catch {
      return new Set();
    }
  }

  private persist(dismissed: Set<number>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed]));
    } catch {
      // localStorage unavailable — dismiss is session-only
    }
  }
}

export type SuggestionFilter = RepoSuggestionType | 'all';
