export type VisibilityAction = 'private' | 'public';

export interface VisibilityRequest {
  fullName: string;
  visibility: VisibilityAction;
}

export interface VisibilityResult {
  fullName: string;
  visibility: VisibilityAction;
  success: boolean;
  message?: string;
}

export interface VisibilityResponse {
  success: boolean;
  results: VisibilityResult[];
}
