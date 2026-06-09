import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="hiw-page">

      <header class="hiw-hero">
        <h1 class="hiw-hero__title">How CodeShelf Judges Your Repos</h1>
        <p class="hiw-hero__subtitle">
          Every score and suggestion is based on signals that are visible right now — no guessing, no magic.
          Here's exactly what we look at and why.
        </p>
      </header>

      <section class="hiw-section">
        <h2 class="hiw-section__title">
          <span class="hiw-section__icon">📊</span>
          Portfolio Score
        </h2>
        <p class="hiw-section__intro">
          This score answers: <strong>"Would a recruiter or collaborator be impressed by this repo?"</strong>
          Higher is better. Anything above 60 is considered a portfolio candidate.
        </p>
        <div class="hiw-factors">
          <div class="hiw-factor hiw-factor--positive">
            <span class="hiw-factor__label">Adds points</span>
            <ul class="hiw-factor__list">
              <li>Has a description</li>
              <li>Has at least one star</li>
              <li>Has been forked by others</li>
              <li>Has a recognized programming language</li>
              <li>Updated recently (within the last year)</li>
              <li>Not a fork of someone else's repo</li>
              <li>Not archived</li>
            </ul>
          </div>
          <div class="hiw-factor hiw-factor--negative">
            <span class="hiw-factor__label">Removes points</span>
            <ul class="hiw-factor__list">
              <li>No description</li>
              <li>Zero stars and zero forks</li>
              <li>No detected language</li>
              <li>Not updated in over a year</li>
              <li>Is a fork (lowers originality signal)</li>
              <li>Is archived</li>
            </ul>
          </div>
        </div>
        <p class="hiw-section__note">
          <strong>What to do with this:</strong> Repos scoring 60+ are worth pinning on your GitHub profile or linking in a portfolio.
          Repos below 40 probably aren't helping your public image.
        </p>
      </section>

      <section class="hiw-section">
        <h2 class="hiw-section__title">
          <span class="hiw-section__icon">🧹</span>
          Cleanup Score
        </h2>
        <p class="hiw-section__intro">
          This score answers: <strong>"Does this repo need attention or can it be removed?"</strong>
          Higher means it's more of a cleanup candidate — not that it's bad code, just that it's adding noise.
        </p>
        <div class="hiw-factors">
          <div class="hiw-factor hiw-factor--positive">
            <span class="hiw-factor__label">Raises the cleanup score</span>
            <ul class="hiw-factor__list">
              <li>No description and no stars (looks abandoned)</li>
              <li>Not updated in over 12 months</li>
              <li>Is a fork with no original work on top</li>
              <li>Is archived (already considered inactive)</li>
            </ul>
          </div>
          <div class="hiw-factor hiw-factor--negative">
            <span class="hiw-factor__label">Keeps the cleanup score low</span>
            <ul class="hiw-factor__list">
              <li>Has a description</li>
              <li>Has stars or forks from others</li>
              <li>Updated recently</li>
              <li>Has open issues or pull requests</li>
            </ul>
          </div>
        </div>
        <p class="hiw-section__note">
          <strong>What to do with this:</strong> A high cleanup score doesn't mean delete it — it means take a look.
          Maybe add a description, archive it properly, or make it private if it's just personal scratch work.
        </p>
      </section>

      <section class="hiw-section">
        <h2 class="hiw-section__title">
          <span class="hiw-section__icon">🏷️</span>
          Suggestion Badges
        </h2>
        <p class="hiw-section__intro">
          Badges appear on cards when CodeShelf detects something specific. Each one means something concrete.
        </p>
        <div class="hiw-badges">
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--portfolio">PORTFOLIO</span>
            <p>This repo scores well enough to showcase publicly. Consider pinning it on your GitHub profile.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--warn">NO DESCRIPTION</span>
            <p>No description is set. A one-line description makes a repo look maintained and helps people understand it at a glance.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--warn">OLD &amp; QUIET</span>
            <p>This repo hasn't been updated in over a year and has no stars. It might be worth archiving or deleting.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--info">FORK</span>
            <p>This is a fork of someone else's repo. Forks are fine, but if you haven't added anything to it, it may be worth removing.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--info">ARCHIVED</span>
            <p>This repo is archived on GitHub. It's read-only and signals to visitors that the project is no longer active.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--healthy">HEALTHY</span>
            <p>No issues found. This repo has a description, recent activity, and looks well-maintained.</p>
          </div>
        </div>
      </section>

      <section class="hiw-section">
        <h2 class="hiw-section__title">
          <span class="hiw-section__icon">🤖</span>
          AI Ratings (Optional)
        </h2>
        <p class="hiw-section__intro">
          When you click <strong>Analyse Public Repos</strong>, CodeShelf sends your public repositories to an AI model
          and asks it to rate them. Private repos are <strong>never sent to AI</strong> — that is enforced in the server,
          not just the UI.
        </p>
        <div class="hiw-factors">
          <div class="hiw-factor">
            <span class="hiw-factor__label">Skill rating (1–100)</span>
            <ul class="hiw-factor__list">
              <li>Code quality signals visible from the outside</li>
              <li>Whether the repo looks like real, intentional work</li>
              <li>Language, structure, activity, and description quality</li>
            </ul>
          </div>
          <div class="hiw-factor">
            <span class="hiw-factor__label">Professionalism rating (1–100)</span>
            <ul class="hiw-factor__list">
              <li>Does it look maintained and documented?</li>
              <li>Would a stranger know what this is for?</li>
              <li>Is it something you'd be comfortable linking publicly?</li>
            </ul>
          </div>
        </div>
        <div class="hiw-ai-chips">
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--danger">AI: consider deleting</span>
            <p>The AI thinks this repo adds noise to your profile — no description, no activity, no clear purpose.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--warn">AI: consider private</span>
            <p>The AI thinks this repo isn't ready for public consumption — could be a fork, experiment, or work in progress.</p>
          </div>
        </div>
        <p class="hiw-section__note">
          <strong>AI ratings are advisory only.</strong> The AI doesn't have access to your actual code —
          only the metadata CodeShelf already shows you. It can be wrong. You make every decision.
        </p>
      </section>

      <section class="hiw-section hiw-section--actions">
        <h2 class="hiw-section__title">
          <span class="hiw-section__icon">⚡</span>
          Actions
        </h2>
        <div class="hiw-actions-grid">
          <div class="hiw-action-card">
            <h3 class="hiw-action-card__title">Make Private</h3>
            <p>Hides the repo from public view. The code and history are preserved — only you can see it. Good for experiments or work in progress you're not ready to share.</p>
          </div>
          <div class="hiw-action-card">
            <h3 class="hiw-action-card__title">Make Public</h3>
            <p>Exposes the repo to the internet. <strong>Everything</strong> — code, commit history, and file contents — becomes publicly visible. Always check for passwords or secrets before doing this.</p>
          </div>
          <div class="hiw-action-card hiw-action-card--danger">
            <h3 class="hiw-action-card__title">Delete</h3>
            <p>Permanently removes the repo from GitHub. There is no undo. Enable the deletion toggle first, then select repos individually — there is no "delete all" shortcut by design.</p>
          </div>
        </div>
      </section>

      <div class="hiw-footer">
        <a routerLink="/" class="hiw-back">← Back to your repos</a>
      </div>

    </main>
  `,
  styles: [`
    .hiw-page {
      max-width: var(--layout-setup-max-width);
      margin: 0 auto;
      padding: var(--space-8) var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-10);
    }
    .hiw-hero { text-align: center; display: flex; flex-direction: column; gap: var(--space-3); }
    .hiw-hero__title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
    }
    .hiw-hero__subtitle {
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
      max-width: 56ch;
      margin: 0 auto;
    }
    .hiw-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
      padding: var(--space-6);
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
    }
    .hiw-section__title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .hiw-section__icon { font-size: var(--font-size-xl); }
    .hiw-section__intro {
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
    }
    .hiw-section__note {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
      padding: var(--space-3) var(--space-4);
      border-left: 3px solid var(--color-primary);
      background: var(--bg-surface);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      line-height: var(--leading-relaxed);
    }
    .hiw-factors {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }
    @media (max-width: 600px) {
      .hiw-factors { grid-template-columns: 1fr; }
    }
    .hiw-factor {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .hiw-factor--positive { border-color: var(--color-success); }
    .hiw-factor--negative { border-color: var(--color-danger); }
    .hiw-factor__label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
      letter-spacing: var(--tracking-wide);
      color: var(--text-muted);
    }
    .hiw-factor--positive .hiw-factor__label { color: var(--color-success); }
    .hiw-factor--negative .hiw-factor__label { color: var(--color-danger-fg); }
    .hiw-factor__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .hiw-factor__list li {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      padding-left: var(--space-4);
      position: relative;
      line-height: var(--leading-snug);
    }
    .hiw-factor--positive .hiw-factor__list li::before { content: '+'; position: absolute; left: 0; color: var(--color-success); font-weight: var(--font-weight-bold); }
    .hiw-factor--negative .hiw-factor__list li::before { content: '−'; position: absolute; left: 0; color: var(--color-danger-fg); font-weight: var(--font-weight-bold); }
    .hiw-factor__list li::before { content: '·'; position: absolute; left: 0; color: var(--text-muted); }
    .hiw-badges, .hiw-ai-chips {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .hiw-badge-row {
      display: flex;
      align-items: baseline;
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .hiw-badge-row p {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
      flex: 1;
      min-width: 200px;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      padding: var(--space-1) var(--space-3);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .badge-pill--portfolio { background: var(--badge-public-bg);   color: var(--badge-public-fg); }
    .badge-pill--warn      { background: var(--color-warning-bg, rgba(245,158,11,0.12)); color: var(--color-warning-fg, #f59e0b); }
    .badge-pill--info      { background: var(--badge-archived-bg); color: var(--badge-archived-fg); }
    .badge-pill--healthy   { background: var(--color-success-bg, rgba(34,197,94,0.12)); color: var(--color-success); }
    .badge-pill--danger    { background: var(--color-danger-bg);   color: var(--color-danger-fg); }
    .hiw-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: var(--space-4);
    }
    @media (max-width: 700px) {
      .hiw-actions-grid { grid-template-columns: 1fr; }
    }
    .hiw-action-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }
    .hiw-action-card--danger { border-color: var(--color-danger); }
    .hiw-action-card__title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--text-primary);
    }
    .hiw-action-card--danger .hiw-action-card__title { color: var(--color-danger-fg); }
    .hiw-action-card p {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
    }
    .hiw-footer { text-align: center; }
    .hiw-back {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
      text-decoration: none;
      transition: color var(--duration-fast) var(--ease-default);
    }
    .hiw-back:hover { color: var(--text-primary); }
  `]
})
export class HowItWorksComponent {}
