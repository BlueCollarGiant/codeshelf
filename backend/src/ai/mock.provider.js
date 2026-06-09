export class MockLlmProvider {
  async analyzeRepos(repos) {
    return repos.map((repo, i) => ({
      repoId:               repo.id,
      repoName:             repo.name,
      skillRating:          60 + ((i * 13) % 40),
      professionalismRating: 55 + ((i * 17) % 45),
      suggestDeletion:      !repo.description && repo.stargazersCount === 0,
      suggestMakePrivate:   repo.fork,
      summary:              `Mock analysis for ${repo.name}. ${repo.description ? 'Has a description.' : 'Missing description.'} ${repo.fork ? 'This is a fork.' : ''}`.trim(),
      flags:                [
        ...(!repo.description ? ['no-description'] : []),
        ...(repo.fork        ? ['is-fork']         : []),
        ...(repo.archived    ? ['archived']         : []),
      ],
    }));
  }
}
