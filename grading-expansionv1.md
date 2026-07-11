# CodeShelf Grading Expansion V1

Status: Planning

Purpose: Replace shallow repository metadata grading with a layered, evidence-based review system that gives developers useful technical feedback without pretending metadata alone can prove engineering quality.

## Product Direction

CodeShelf should separate three jobs that are currently blended together:

1. Quick Scan organizes the repository shelf.
2. Deep Scan evaluates engineering evidence.
3. AI explains the evidence and recommends the next move.

The deterministic engine owns classifications, signals, scores, and evidence. AI must not invent engineering quality from weak metadata or become the source of truth for numeric grading.

## Current-System Findings

### Classification mixes unrelated concepts

The current repository types combine project kind, lifecycle state, and quality judgment into one label. A repository can be a web application, active, and portfolio-facing at the same time, but the current classifier must choose one value.

The redesign should separate these axes:

```ts
interface RepoIdentity {
  kind: RepoKind;
  lifecycle: RepoLifecycle;
  audience: RepoAudience;
}
```

Suggested values:

```ts
type RepoKind =
  | 'profile'
  | 'web_app'
  | 'api'
  | 'library'
  | 'cli'
  | 'template'
  | 'documentation'
  | 'config'
  | 'learning'
  | 'unknown';

type RepoLifecycle =
  | 'empty'
  | 'prototype'
  | 'active'
  | 'maintained'
  | 'stable'
  | 'stale'
  | 'archived';

type RepoAudience =
  | 'portfolio'
  | 'public_utility'
  | 'private_work'
  | 'personal';
```

### The current four scores are too shallow

The existing local scorer uses repository metadata such as description, topics, language, license, stars, dates, visibility, fork state, and archive state. That is enough for a fast GitHub profile scan, but it cannot meaningfully grade whether a project is tested, maintainable, secure, deployable, or understandable to another developer.

Adding Presentation and Maintenance helps, but six generic scores still leave out the strongest engineering signals:

- Tests and test execution
- CI verification
- Type checking
- Linting and formatting
- Dependency hygiene
- Build validation
- Deployment readiness
- Security automation
- Release and versioning practices

### Activity is not quality

Activity should remain visible because it describes project state, but it should not be treated as a strong quality measure.

An old, complete utility can be excellent. A repository pushed yesterday can still be broken scaffolding.

Keep the current continuous activity decay, but treat activity as lifecycle evidence rather than a major quality score.

### Cleanup uses the opposite score direction

Portfolio, Activity, and Completeness use higher-is-better scoring. Cleanup uses higher-is-worse scoring. That is easy to misread.

Rename Cleanup to one of the following:

- Lifecycle Risk
- Attention Needed
- Cleanup Priority

Keep it separate from quality averages.

### README length is not README quality

README grading must not rely primarily on byte thresholds. A long README can still be useless, and a concise README can be excellent.

README evidence should inspect whether the document includes relevant signals:

- Clear project purpose
- Installation instructions
- Usage examples
- Configuration or environment setup
- Screenshots or demo link where relevant
- Architecture or technical explanation
- Testing instructions
- License or contribution guidance
- Known limitations
- Clear headings and code examples

Length may be supporting evidence, but it must never determine the verdict by itself.

### Maintenance cannot be inferred from repository age alone

Time between `createdAt` and `pushedAt` is not enough to prove stewardship. Two commits four years apart do not equal four years of maintenance.

Maintenance should use stronger evidence when available:

- Active months rather than raw age
- Commit distribution
- Releases and tags
- Changelog maintenance
- Recent dependency updates
- CI health
- Dependabot or Renovate configuration
- Issue response history when enough context exists

When evidence is unavailable, CodeShelf should report Unknown or Low Confidence rather than manufacture precision.

## Core Grading Principles

### Evidence before scores

Every score contribution must create an evidence item. No unexplained points.

```ts
interface EvidenceItem {
  id: string;
  category: EvidenceCategory;
  status: 'present' | 'missing' | 'warning' | 'unknown';
  detail: string;
  source?: string;
  weight?: number;
}
```

### Unknown is a valid result

Missing data must not silently become a neutral score. A category with weak coverage should show low confidence or Unknown.

### Scores are goal-relative

A repository should not receive one universal overall grade. CodeShelf should expose separate lenses because portfolio quality, engineering quality, maintenance quality, and cleanup priority answer different questions.

### Repository kind changes the rubric

A CLI, API, library, profile README, and web app should not share identical weights.

### Deterministic scoring owns numbers

AI may interpret evidence, identify relationships, summarize tradeoffs, and recommend actions. AI must not own the canonical numeric grade.

### Local-first privacy remains binding

Private repositories must remain blocked from external AI providers. Deep Scan may still analyze them locally and deterministically. A local Ollama provider may receive private evidence only through an explicit separate setting and clear user consent.

## Layer 1: Quick Scan

Quick Scan runs automatically across every owned repository using low-cost GitHub metadata.

It answers:

- What kind of repository is this likely to be?
- What lifecycle state is it in?
- Who is it likely intended for?
- Does its public listing need attention?
- Is it a likely portfolio candidate?
- Is deeper analysis worth running?

Suggested output:

```ts
interface QuickRepoAssessment {
  repoId: number;
  identity: RepoIdentity;
  activitySignal: number;
  discoverabilityScore: number;
  lifecycleRisk: number;
  deepScanRecommended: boolean;
  confidence: 'low' | 'medium' | 'high';
  evidence: EvidenceItem[];
}
```

### Quick Scan signals

Quick Scan may use:

- Repository name
- Description
- Visibility
- Fork, archive, disabled, and template state
- Primary language
- Topics
- License presence
- Stars and forks as weak context only
- Open issue count as context only
- Created, pushed, and updated dates
- Repository size
- Default branch
- GitHub homepage URL if available

### Quick Scan outputs should not claim engineering quality

Quick Scan may say:

- Strong portfolio candidate
- Public listing needs context
- Empty repository
- Likely unchanged fork
- Stable archived project
- New prototype
- Deep Scan recommended

It should not claim:

- Strong code quality
- Well-tested
- Production-ready
- Secure
- Maintainable

Those require repository contents.

## Layer 2: Deep Scan

Deep Scan runs on selected repositories. It inspects the repository tree and a bounded set of high-value files.

### Evidence collector scope

Collect evidence from:

- README and documentation files
- Root file tree and selected recursive paths
- Package manifests and lockfiles
- Test files and test configuration
- CI workflows
- Lint and formatting configuration
- Compiler and type-checking configuration
- Deployment files
- Environment examples
- Dependency automation configuration
- Security workflows
- Releases, tags, and changelog evidence
- Contribution guidance
- License files

### Bounded collection rules

Deep Scan must remain predictable and rate-limit aware.

- Start with the root tree.
- Select files through deterministic allowlists and size limits.
- Do not fetch arbitrary binary files.
- Do not download entire repositories by default.
- Cache evidence in memory for the session.
- Track GitHub rate-limit cost.
- Support a refresh action for stale evidence.
- Record the commit SHA or evidence hash used for the scan.

### Suggested evidence categories

```ts
type EvidenceCategory =
  | 'documentation'
  | 'verification'
  | 'maintainability'
  | 'delivery'
  | 'security'
  | 'portfolio'
  | 'lifecycle';
```

## Layer 3: Deterministic Developer Scorecard

The primary scorecard should contain the following dimensions.

### Documentation and Onboarding

Measures whether another developer can understand, install, configure, run, and contribute to the project.

Possible evidence:

- README exists
- Purpose is clearly stated
- Installation steps exist
- Usage example exists
- Environment setup is documented
- Architecture or technical decisions are explained
- Testing instructions exist
- Contribution guidance exists where appropriate
- Known limitations are documented

### Verification

Measures how consistently the project proves that it works.

Possible evidence:

- Test files exist
- Test script exists
- Tests are run in CI
- Build runs in CI
- Lint runs in CI
- Type checking runs in CI
- End-to-end tests exist where relevant
- Coverage tooling exists
- CI status is healthy when status data is available

### Maintainability

Measures how easy the project is to understand and safely change.

Possible evidence:

- Clear source structure
- Centralized configuration
- Type safety or static analysis
- Linting and formatting
- Dependency organization
- Reusable modules or components
- Reasonable separation of concerns
- Consistent naming and scripts
- Low duplication indicators when measurable
- Architecture documentation for complex projects

Maintainability must avoid pretending a file count alone proves quality.

### Delivery Readiness

Measures whether the project can be reliably shipped, released, or consumed.

Possible evidence:

- Reproducible build script
- Deployment configuration
- Environment example
- Release or versioning setup
- Changelog
- Package metadata for libraries or CLIs
- Container or hosting configuration where relevant
- Production configuration boundaries
- Health checks for services where relevant

### Security Hygiene

Measures visible defensive practices without claiming a full security audit.

Possible evidence:

- Secrets excluded from source control
- `.env.example` rather than committed secrets
- Dependency update automation
- Security scanning workflow
- Lockfile present
- Safe environment documentation
- Branch or CI security checks where visible
- No obvious credential-like files in tracked paths

The UI must label this dimension as hygiene, not proof of security.

### Portfolio Impact

Measures how effectively the repository communicates skill and outcomes to a human reviewer.

Possible evidence:

- Clear purpose
- Strong project description
- Demo or deployment link
- Screenshots for visual products
- Technical decisions explained
- Meaningful feature summary
- Visible outcome or user value
- Repository topics and discoverability
- Appropriate license
- Clear status and limitations

### Lifecycle Health

Describes project state rather than pure quality.

Possible evidence:

- Recent meaningful activity
- Active months
- Releases or tags
- Dependency updates
- Open issues relative to activity
- Archived status
- Explicit maintenance status
- Evidence that the project is complete and intentionally stable

Lifecycle Health should not be blindly averaged into engineering quality.

## Goal-Relative Lenses

### Portfolio Lens

Prioritize:

- Documentation and onboarding
- Demo and screenshots
- Clear purpose
- Technical explanation
- Delivery evidence
- Project completeness

Example output:

```text
Portfolio: 84
```

### Engineering Lens

Prioritize:

- Verification
- Maintainability
- Type safety
- Architecture
- Security hygiene
- Build reliability

Example output:

```text
Engineering: 76
```

### Maintenance Lens

Prioritize:

- Lifecycle health
- Dependency management
- Releases
- Automation
- Issue stewardship
- Long-term activity distribution

Example output:

```text
Maintenance: 61
```

### Cleanup Lens

Prioritize:

- Empty repositories
- Abandoned experiments
- Unchanged forks
- Unexplained public repositories
- Superseded projects
- Missing ownership or purpose signals

Example output:

```text
Cleanup risk: 8
```

## Kind-Specific Rubrics

Weights should change according to repository kind.

| Signal | Web app | Library | API | CLI | Profile |
|---|---:|---:|---:|---:|---:|
| Live demo | High | Low | Medium | Low | Medium |
| README usage examples | Medium | High | High | High | High |
| API documentation | Low | Medium | High | Low | None |
| Release and versioning | Low | High | Medium | High | None |
| Test suite | High | High | High | High | None |
| Screenshots | High | Low | Low | Low | Medium |
| License | Medium | High | Medium | Medium | None |

### Suggested kind detection evidence

- `package.json`, framework dependencies, and deployment files for web apps
- Server frameworks, route folders, OpenAPI files, and service configs for APIs
- Package export metadata for libraries
- Binary entries and CLI frameworks for CLIs
- Profile-name match for profile repositories
- Template repository flag or template topics for templates
- Documentation-only trees for documentation repositories
- Dotfiles and shell/config patterns for configuration repositories

Kind detection should produce confidence and evidence instead of a silent guess.

## Evidence-First UI

A numeric tile alone is not enough. Each dimension must be expandable.

Example:

```text
Verification: 82

Found:
✓ 47 test files
✓ npm test script
✓ TypeScript strict mode
✓ Pull request CI runs tests and build

Missing:
! No coverage command
! No end-to-end test configuration
```

### Card-level summary

Keep repository cards compact:

- Identity chips for kind, lifecycle, and audience
- Portfolio Lens score
- Engineering Lens score
- Cleanup Risk
- Confidence or evidence coverage
- Deep Scan status
- Highest-priority next action

### Expanded evidence drawer

Include:

- All score dimensions
- Evidence grouped by category
- Strengths
- Missing signals
- Unknown signals
- Score contribution breakdown
- Evidence source paths
- Scan commit SHA or evidence timestamp
- AI review if available

### Score direction

All quality scores should use higher-is-better.

Risk and attention metrics should be visually separate and explicitly labeled higher-is-worse.

## AI Redesign

## Root Cause of Current AI Failure

The current AI receives repository metadata but is asked to judge coding skill and professionalism. It does not receive source code, tests, workflows, dependency files, README evidence, build configuration, release evidence, or deterministic findings.

That makes confident skill ratings educated guesses.

## AI Role

AI should interpret evidence, not invent canonical scores.

Remove AI-owned `skillRating` and `professionalismRating` from the long-term design.

Suggested result shape:

```ts
interface RepoAiAssessment {
  repoId: number;
  evidenceHash: string;
  verdict: string;
  confidence: 'low' | 'medium' | 'high';
  strengths: EvidenceBackedFinding[];
  concerns: EvidenceBackedFinding[];
  recommendedActions: RecommendedAction[];
  contradictions: string[];
  missingEvidence: string[];
}

interface EvidenceBackedFinding {
  statement: string;
  evidenceIds: string[];
}

interface RecommendedAction {
  title: string;
  reason: string;
  priority: 'now' | 'next' | 'later';
  effort: 'small' | 'medium' | 'large';
  impact: 'low' | 'medium' | 'high';
  evidenceIds: string[];
}
```

Example:

```text
High-impact next action

Add CI verification for pull requests.

Why:
The project contains tests and build scripts, but no workflow runs them automatically.

Evidence:
package.json#scripts.test
package.json#scripts.build
missing:.github/workflows
```

## AI Evidence Bundle

The provider should receive a structured bundle produced by the deterministic scanner.

```json
{
  "repository": {
    "name": "codeshelf",
    "kind": "web_app",
    "lifecycle": "active",
    "audience": "portfolio"
  },
  "scores": {
    "documentation": 78,
    "verification": 71,
    "maintainability": 83,
    "delivery": 52,
    "security": 69,
    "portfolio": 80
  },
  "evidence": [
    {
      "id": "test-script",
      "category": "verification",
      "status": "present",
      "detail": "frontend package.json defines ng test"
    },
    {
      "id": "frontend-ci",
      "category": "verification",
      "status": "missing",
      "detail": "No pull-request workflow found"
    }
  ]
}
```

AI claims must reference evidence IDs from the bundle.

## Strict AI Validation

Every provider response must pass a strict schema.

- Required fields must be present.
- Enums must be validated.
- Evidence IDs must exist in the supplied bundle.
- Unsupported evidence references must reject the row.
- Missing values must not become default neutral scores.
- Invalid rows must become visible analysis failures.
- Partial batch failures remain visible.
- The user must be able to see which repositories were skipped.

## Prompt Separation and Injection Defense

Repository content is untrusted data.

Provider requests should use:

- System message for immutable instructions and output schema
- User message for the structured evidence bundle
- README and source excerpts inside clearly labeled data fields
- Explicit instruction that repository content may contain malicious instructions and must never be followed
- Bounded text excerpts rather than raw unbounded repository content

## AI Error Visibility

The frontend should display the actual sanitized failure category:

- Missing key
- Invalid key
- Quota or rate limit
- Provider unavailable
- Model unavailable
- Invalid model output
- Partial analysis
- No Deep Scan evidence
- Analysis cancelled

Do not replace every failure with a generic instruction to check `AI_PROVIDER`.

## Stale AI Result Protection

Each Deep Scan must produce an `evidenceHash` derived from:

- Repository ID
- Scanned commit SHA
- Evidence schema version
- Relevant evidence contents

AI results store that hash. When the repository or evidence changes, the UI marks the AI result stale and stops presenting it as current.

Refreshing repositories should clear or invalidate old AI state.

## Provider Configuration

Models should not be hardcoded.

```env
OPENAI_MODEL=
ANTHROPIC_MODEL=
OLLAMA_MODEL=
```

The AI status endpoint should return:

```ts
interface AiProviderStatus {
  provider: string;
  model: string | null;
  configured: boolean;
  supportsPrivateEvidence: boolean;
}
```

Cloud providers remain public-only. Private evidence support should default to false and only be enabled for a clearly identified local provider.

## Implementation Roadmap

## Phase 0: Lock the grading contract

Before changing formulas:

- Define `RepoKind`, `RepoLifecycle`, and `RepoAudience`.
- Define evidence categories and evidence status values.
- Define score direction and meaning.
- Define quality scores separately from risk signals.
- Define confidence and evidence coverage.
- Create a versioned grading schema.
- Build a fixture set with known expected outcomes.
- Document privacy boundaries for public, private, cloud AI, and local AI paths.

### Phase 0 acceptance criteria

- Every output field has one clear meaning.
- No score mixes higher-is-better and higher-is-worse semantics.
- Unknown and low-confidence states are representable.
- Existing profile and ownership protections remain binding.
- No implementation assumes a fixed count of score dimensions.

## Phase 1: Correct Quick Scan

- Split classification into kind, lifecycle, and audience.
- Keep continuous activity decay.
- Rename Cleanup to Lifecycle Risk or Cleanup Priority.
- Remove stars from core quality calculations.
- Preserve stars and forks as weak contextual evidence.
- Preserve empty-repo detection.
- Preserve profile repository protections.
- Preserve archived repository handling.
- Preserve fork handling, but record confidence around modified versus unmodified status.
- Add evidence and confidence to Quick Scan results.
- Update dashboard filters and sort options.
- Update scoring documentation and the How It Works page.

### Phase 1 acceptance criteria

- A profile repository is never graded like a failed software project.
- A completed archived project is not automatically treated as bad.
- A new prototype is not treated as abandoned.
- A stale public repository can have high quality but elevated lifecycle risk.
- Every Quick Scan verdict has visible evidence.

## Phase 2: Build Deep Scan evidence collection

- Add repository tree endpoints behind the backend token boundary.
- Add bounded file selection rules.
- Add README and documentation inspection.
- Add package manifest and script inspection.
- Add test and test-config detection.
- Add CI workflow inspection.
- Add compiler, lint, and formatting configuration detection.
- Add deployment and environment evidence.
- Add dependency automation and security workflow evidence.
- Add release, tag, and changelog evidence.
- Add session cache and rate-limit reporting.
- Add scan commit SHA and evidence hash.

### Phase 2 acceptance criteria

- Deep Scan never downloads arbitrary binaries.
- Rate-limit cost is bounded and visible.
- Every collected fact has a source path.
- Private repository evidence stays local unless the user explicitly chooses an allowed local AI path.
- Re-running an unchanged scan reuses cached evidence during the session.

## Phase 3: Deterministic developer scorecard

Implement:

- Documentation and Onboarding
- Verification
- Maintainability
- Delivery Readiness
- Security Hygiene
- Portfolio Impact
- Lifecycle Health

Add kind-specific weight tables and score explanations.

### Phase 3 acceptance criteria

- Every score point maps to evidence.
- Missing evidence lowers coverage rather than silently becoming neutral.
- Scores are stable for identical evidence.
- The same repository can be viewed through Portfolio, Engineering, Maintenance, and Cleanup lenses.
- Kind-specific rubrics produce sensible differences between apps, APIs, libraries, CLIs, and profile repositories.

## Phase 4: Evidence-first UI

- Keep summary cards compact.
- Add identity chips for kind, lifecycle, and audience.
- Add lens selector.
- Add confidence or evidence coverage.
- Add Deep Scan status and action.
- Add expandable evidence drawer.
- Show strengths, missing signals, warnings, and unknowns.
- Show score contribution breakdowns.
- Show source file paths.
- Show evidence timestamp and commit SHA.
- Replace unexplained score tiles with evidence-aware summaries.

### Phase 4 acceptance criteria

- A developer can explain why every score exists without reading source code.
- Higher-is-worse metrics are visually separate from quality scores.
- Unknown results are visibly different from average results.
- The highest-priority next action is visible without expanding the entire report.

## Phase 5: AI evidence reviewer

- Replace metadata-only AI input with evidence bundles.
- Remove AI-owned canonical numeric ratings.
- Add strict schema validation.
- Require evidence references for findings and recommendations.
- Add priority, effort, and impact to actions.
- Add confidence and missing-evidence reporting.
- Separate system instructions from untrusted repository content.
- Add prompt-injection defenses.
- Add provider model configuration.
- Add sanitized error details to the frontend.
- Add evidence hashing and stale-result invalidation.
- Preserve sequential batching and visible partial failures.

### Phase 5 acceptance criteria

- AI cannot cite evidence that was not supplied.
- AI output cannot change deterministic scores.
- Invalid model output is rejected instead of repaired with invented defaults.
- Refreshing or changing repository evidence invalidates stale AI output.
- Cloud AI never receives private repository evidence.
- The AI recommendation is actionable, evidence-backed, and ordered by priority.

## Phase 6: Calibration and evaluation

Create permanent fixtures representing:

- Polished production web app
- Strong reusable library
- Well-documented API
- Good archived project
- New prototype
- Empty repository
- Modified fork
- Unmodified fork
- Profile README
- Learning project
- Old but stable utility
- Active but poorly engineered project
- Strong engineering project with weak portfolio presentation
- Strong portfolio presentation with weak verification

For each fixture, lock expected ranges, identity, confidence, evidence, and recommendations.

### Phase 6 acceptance criteria

- Rankings make sense across different repository kinds.
- Archived completion is distinguishable from abandonment.
- Recent activity cannot hide missing verification.
- Stars cannot overpower weak engineering evidence.
- README length cannot overpower missing substance.
- AI recommendations remain consistent with deterministic evidence.
- Changes to weights require fixture updates and explicit review.

## Testing Strategy

### Unit tests

- Kind detection
- Lifecycle detection
- Audience detection
- Evidence extraction
- Score contribution functions
- Confidence calculation
- Lens weighting
- Evidence hash stability
- AI schema validation
- Unsupported evidence rejection

### Fixture tests

Use table-driven tests keyed by fixture name and score dimension. Do not rely on positional tuples or hard-coded dimension counts.

### Contract tests

- GitHub sanitizer output
- Deep Scan API response
- AI evidence bundle
- AI provider result schema
- Frontend model compatibility

### Safety tests

- Private repositories blocked from cloud AI
- Profile repository remains protected
- Ownership guard remains enforced
- Repository content cannot alter system instructions
- Binary and oversized files are not fetched
- Stale AI results are invalidated

## Migration Notes

- Keep the current four-score system operational while Quick Scan is refactored.
- Introduce new models additively behind a versioned grading contract.
- Do not pre-add speculative score fields before their evidence and UI exist.
- Avoid a single breaking rewrite of classification, scanning, scoring, UI, and AI.
- Remove legacy scores only after the new scorecard reaches fixture parity and the documentation is updated.

## Final Product Rule

Quick Scan organizes the shelf. Deep Scan evaluates the engineering. AI explains the evidence and recommends the next move.

CodeShelf should never claim more certainty than its evidence supports.