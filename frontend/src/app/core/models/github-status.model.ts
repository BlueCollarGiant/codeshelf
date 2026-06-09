export interface GitHubStatus {
  tokenPresent: boolean;
  tokenValid: boolean;
  rateLimitRemaining: number | null;
  rateLimitReset: string | null;
  scopes: string | null;
}
