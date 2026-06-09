import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { VisibilityRequest, VisibilityResponse } from '../models/action-result.model';

const API = 'http://localhost:3000/api';
const ACTION_HEADER = 'X-CodeShelf-Action';

@Injectable({ providedIn: 'root' })
export class RepoActionsService {
  private readonly http = inject(HttpClient);

  setVisibility(repos: VisibilityRequest[]): Promise<VisibilityResponse> {
    return firstValueFrom(
      this.http.post<VisibilityResponse>(
        `${API}/github/repos/visibility`,
        { repos },
        { headers: { [ACTION_HEADER]: 'visibility' } },
      )
    );
  }
}
