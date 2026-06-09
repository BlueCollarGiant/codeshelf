export interface RepoAiResult {
  repoId:              number;
  repoName:            string;
  skillRating:         number;
  professionalismRating: number;
  suggestDeletion:     boolean;
  suggestMakePrivate:  boolean;
  summary:             string;
  flags:               string[];
}
