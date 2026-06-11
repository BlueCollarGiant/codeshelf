import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SafeGitHubRepo } from '../models/github-repo.model';
import { RepoAiResult } from '../models/repo-ai-result.model';
import { RepoType } from '../models/repo-type.model';
import { API_BASE as API } from '../api.constants';

export interface AiProviderStatus {
  provider: string;
  configured: boolean;
}

export type RepoWithType = SafeGitHubRepo & { repoType: RepoType };

@Injectable({ providedIn: 'root' })
export class AiApiService {
  private readonly http = inject(HttpClient);

  getStatus(): Promise<AiProviderStatus> {
    return firstValueFrom(this.http.get<AiProviderStatus>(`${API}/ai/status`));
  }

  analyzeRepos(repos: RepoWithType[]): Promise<{ results: RepoAiResult[]; warnings?: string[] }> {
    return firstValueFrom(
      this.http.post<{ results: RepoAiResult[]; warnings?: string[] }>(`${API}/ai/analyse`, { repos })
    );
  }
}
