import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SafeGitHubRepo } from '../models/github-repo.model';
import { RepoAiResult } from '../models/repo-ai-result.model';

const API = 'http://localhost:3000/api';

export interface AiProviderStatus {
  provider: string;
  configured: boolean;
}

@Injectable({ providedIn: 'root' })
export class AiApiService {
  private readonly http = inject(HttpClient);

  getStatus(): Promise<AiProviderStatus> {
    return firstValueFrom(this.http.get<AiProviderStatus>(`${API}/ai/status`));
  }

  analyzeRepos(repos: SafeGitHubRepo[]): Promise<{ results: RepoAiResult[] }> {
    return firstValueFrom(
      this.http.post<{ results: RepoAiResult[] }>(`${API}/ai/analyse`, { repos })
    );
  }
}
