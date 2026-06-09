import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SafeGitHubRepo } from '../models/github-repo.model';
import { GitHubStatus } from '../models/github-status.model';
import { GitHubUser } from '../models/github-user.model';

const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class RepoApiService {
  private readonly http = inject(HttpClient);

  getStatus(): Promise<GitHubStatus> {
    return firstValueFrom(this.http.get<GitHubStatus>(`${API}/github/status`));
  }

  getUser(): Promise<GitHubUser> {
    return firstValueFrom(this.http.get<GitHubUser>(`${API}/github/me`));
  }

  getRepos(): Promise<SafeGitHubRepo[]> {
    return firstValueFrom(this.http.get<SafeGitHubRepo[]>(`${API}/github/repos`));
  }
}
