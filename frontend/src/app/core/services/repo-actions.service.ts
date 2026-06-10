import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { VisibilityRequest, VisibilityResponse, DeleteRequest, DeleteResponse } from '../models/action-result.model';
import { API_BASE as API } from '../api.constants';

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

  deleteRepos(repos: DeleteRequest[]): Promise<DeleteResponse> {
    return firstValueFrom(
      this.http.post<DeleteResponse>(
        `${API}/github/repos/delete`,
        { repos },
        { headers: { [ACTION_HEADER]: 'delete' } },
      )
    );
  }
}
