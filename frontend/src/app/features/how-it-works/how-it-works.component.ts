import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <main class="hiw-page">

      <header class="hiw-hero">
        <h1 class="hiw-hero__title">How CodeShelf Judges Your Repos</h1>
        <p class="hiw-hero__subtitle">
          Every score and badge is based on signals visible right now — no guessing, no magic.
          Here's exactly what we look at and why.
        </p>
      </header>

      <!-- REPO TYPE -->
      <section class="hiw-section">
        <h2 class="hiw-section__title">
          <svg class="hiw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
          Step 1 — Repo Type
        </h2>
        <p class="hiw-section__intro">
          Before any scoring runs, CodeShelf classifies what kind of repo it's looking at.
          Different types have different rules — a profile README and an experiment don't deserve the same judgement.
        </p>
        <div class="hiw-types-grid">
          <div class="hiw-type-card hiw-type-card--profile">
            <span class="hiw-type-chip">Profile repo</span>
            <p>Your GitHub profile README — the repo whose name matches your username. <strong>Protected.</strong> Cleanup score is always 0, delete suggestion never fires.</p>
          </div>
          <div class="hiw-type-card hiw-type-card--portfolio">
            <span class="hiw-type-chip">Portfolio project</span>
            <p>Public, described, has a language, updated in the last year. Scored for showcase quality.</p>
          </div>
          <div class="hiw-type-card hiw-type-card--portfolio">
            <span class="hiw-type-chip">Active project</span>
            <p>Updated recently and has enough signals (description or stars). Treated like a portfolio project but scored slightly more leniently.</p>
          </div>
          <div class="hiw-type-card hiw-type-card--config">
            <span class="hiw-type-chip">Config / dotfiles</span>
            <p>Detected by name (dotfiles, .config, setup) or topics (zsh, bash, macos). Cleanup score is always 0 — these are intentional repos, not noise.</p>
          </div>
          <div class="hiw-type-card hiw-type-card--template">
            <span class="hiw-type-chip">Template</span>
            <p>Name or topics contain "template". Scored for reusability — description, language, and stars matter most.</p>
          </div>
          <div class="hiw-type-card hiw-type-card--neutral">
            <span class="hiw-type-chip">Fork</span>
            <p>A fork of someone else's repo. Gets a lighter portfolio penalty — you may have done meaningful work on top of it.</p>
          </div>
          <div class="hiw-type-card hiw-type-card--neutral">
            <span class="hiw-type-chip">Archived</span>
            <p>Marked archived on GitHub. Read-only, no cleanup suggestions beyond the archive badge itself.</p>
          </div>
          <div class="hiw-type-card hiw-type-card--old">
            <span class="hiw-type-chip">Old learning repo</span>
            <p>Inactive for 2+ years, no stars, no description. Likely from an earlier learning phase. Eligible for cleanup suggestions.</p>
          </div>
          <div class="hiw-type-card hiw-type-card--neutral">
            <span class="hiw-type-chip">Experiment</span>
            <p>Recent-ish but no description, no stars, no forks. Looks like a personal scratch project. No harsh penalties — you probably know what it is.</p>
          </div>
        </div>
      </section>

      <!-- PORTFOLIO SCORE -->
      <section class="hiw-section">
        <h2 class="hiw-section__title">
          <svg class="hiw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          Portfolio Score
        </h2>
        <p class="hiw-section__intro">
          <strong>"Would a recruiter or collaborator be impressed by this repo?"</strong>
          Higher is better. Repos scoring 60+ show up in the Portfolio stat at the top of your dashboard.
        </p>
        <div class="hiw-factors">
          <div class="hiw-factor hiw-factor--positive">
            <span class="hiw-factor__label">Adds points</span>
            <ul class="hiw-factor__list">
              <li>Has a description</li>
              <li>Has a recognised programming language</li>
              <li>Updated within the last year</li>
              <li>Not a fork of someone else's repo</li>
              <li>Not archived</li>
              <li>Not private</li>
            </ul>
          </div>
          <div class="hiw-factor hiw-factor--negative">
            <span class="hiw-factor__label">Removes points</span>
            <ul class="hiw-factor__list">
              <li>No description</li>
              <li>No detected language</li>
              <li>Not updated in over a year</li>
              <li>Is a fork (lowers originality signal)</li>
              <li>Is archived</li>
            </ul>
          </div>
        </div>
        <p class="hiw-section__note">
          <strong>Profile repos, config repos, and templates</strong> use their own scoring rubric — they aren't penalised for missing stars or forks the way a portfolio project would be.
        </p>
      </section>

      <!-- CLEANUP SCORE -->
      <section class="hiw-section">
        <h2 class="hiw-section__title">
          <svg class="hiw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Cleanup Score
        </h2>
        <p class="hiw-section__intro">
          <strong>"Does this repo need attention or can it quietly go away?"</strong>
          Higher means it's more of a cleanup candidate — not bad code, just adding noise.
          Protected types (profile, config) always score 0 here.
        </p>
        <div class="hiw-factors">
          <div class="hiw-factor hiw-factor--positive">
            <span class="hiw-factor__label">Raises the cleanup score</span>
            <ul class="hiw-factor__list">
              <li>No description and no stars</li>
              <li>Not updated in over 12 months with zero engagement</li>
              <li>Is a fork</li>
              <li>Is archived</li>
              <li>No detected language</li>
            </ul>
          </div>
          <div class="hiw-factor hiw-factor--negative">
            <span class="hiw-factor__label">Keeps the cleanup score low</span>
            <ul class="hiw-factor__list">
              <li>Has a description</li>
              <li>Has stars or forks from others</li>
              <li>Updated recently</li>
              <li>Has a detected language</li>
            </ul>
          </div>
        </div>
        <p class="hiw-section__note">
          <strong>High cleanup score doesn't mean delete it.</strong> It means take a look — maybe add a description, archive it, or move it to private. The decision is always yours.
        </p>
      </section>

      <!-- ACTIVITY SCORE -->
      <section class="hiw-section">
        <h2 class="hiw-section__title">
          <svg class="hiw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Activity Score
        </h2>
        <p class="hiw-section__intro">
          A simple staleness signal based on when the repo was last pushed to.
        </p>
        <div class="hiw-activity-table">
          <div class="hiw-activity-row">
            <span class="hiw-activity-value hiw-activity-value--high">50</span>
            <span class="hiw-activity-label">Updated within the last 6 months</span>
          </div>
          <div class="hiw-activity-row">
            <span class="hiw-activity-value hiw-activity-value--med">30</span>
            <span class="hiw-activity-label">Updated within the last 12 months</span>
          </div>
          <div class="hiw-activity-row">
            <span class="hiw-activity-value hiw-activity-value--low">10</span>
            <span class="hiw-activity-label">Updated within the last 2 years</span>
          </div>
          <div class="hiw-activity-row">
            <span class="hiw-activity-value hiw-activity-value--none">0</span>
            <span class="hiw-activity-label">Not touched in over 2 years</span>
          </div>
        </div>
        <p class="hiw-section__note">
          A public repo with activity 0 and no stars is what triggers the <strong>Old &amp; quiet</strong> badge.
        </p>
      </section>

      <!-- COMPLETENESS SCORE -->
      <section class="hiw-section">
        <h2 class="hiw-section__title">
          <svg class="hiw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Completeness Score
        </h2>
        <p class="hiw-section__intro">
          How filled-in the repo metadata is. Each of these is worth 25 points — a fully complete repo scores 100.
        </p>
        <div class="hiw-completeness-grid">
          <div class="hiw-completeness-item">
            <svg class="hiw-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="3 8 6.5 11.5 13 4.5"/></svg>
            <div>
              <strong>Description</strong>
              <p>A one-line summary of what the repo does. Without it, AI analysis is weaker and visitors bounce.</p>
            </div>
          </div>
          <div class="hiw-completeness-item">
            <svg class="hiw-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="3 8 6.5 11.5 13 4.5"/></svg>
            <div>
              <strong>Language</strong>
              <p>GitHub's detected primary language. Helps people find your repo and signals what stack you work in.</p>
            </div>
          </div>
          <div class="hiw-completeness-item">
            <svg class="hiw-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="3 8 6.5 11.5 13 4.5"/></svg>
            <div>
              <strong>Topics</strong>
              <p>Framework and tech tags like <code>react</code>, <code>typescript</code>, <code>graphql</code>. Set these in your repo settings — they also show as chips on the card.</p>
            </div>
          </div>
          <div class="hiw-completeness-item">
            <svg class="hiw-check" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="3 8 6.5 11.5 13 4.5"/></svg>
            <div>
              <strong>License</strong>
              <p>Tells contributors how they can use your code. Missing a license means technically no one has permission to use it.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- SUGGESTION BADGES -->
      <section class="hiw-section">
        <h2 class="hiw-section__title">
          <svg class="hiw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Suggestion Badges
        </h2>
        <p class="hiw-section__intro">
          Badges appear on cards when CodeShelf detects something specific. Each one is concrete — not a guess.
        </p>
        <div class="hiw-badges">
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--portfolio">PORTFOLIO</span>
            <p>Scores well enough to showcase. Consider pinning on your GitHub profile.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--info">PROFILE REPO</span>
            <p>Your GitHub profile README. Protected — cleanup rules don't apply.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--info">CONFIG REPO</span>
            <p>Detected as personal config or dotfiles. Protected from cleanup suggestions.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--info">TEMPLATE</span>
            <p>A template repo — scored for reusability rather than portfolio quality.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--warn">NO DESCRIPTION</span>
            <p>No description set. One line makes a repo look maintained and helps the AI give better ratings.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--warn">IMPROVE PROFILE</span>
            <p>Your profile README is missing a description or hasn't been updated in over a year.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--warn">FORK</span>
            <p>A fork of someone else's repo. Fine to keep — but if you haven't added anything, it may be noise.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--danger">OLD &amp; QUIET</span>
            <p>Public, no stars, no forks, no activity in 12+ months. Consider archiving or making private.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--info">ARCHIVED</span>
            <p>Archived on GitHub — read-only, already marked inactive.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--healthy">HEALTHY</span>
            <p>Described, active, no issues found. This repo is doing fine.</p>
          </div>
        </div>
      </section>

      <!-- AI RATINGS -->
      <section class="hiw-section">
        <h2 class="hiw-section__title">
          <svg class="hiw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>
          AI Ratings (Optional)
        </h2>
        <p class="hiw-section__intro">
          When you click <strong>Analyse Public Repos</strong>, CodeShelf sends your public repo metadata to an AI model
          and asks it to rate them. Private repos are <strong>never sent to AI</strong> — enforced in the server, not just the UI.
          The AI never sees your actual code, only the same metadata shown on the cards.
        </p>
        <div class="hiw-ai-legend">
          <div class="hiw-ai-legend-item">
            <span class="chip chip--ai">Skill 70</span>
            <p><strong>Skill (1–100)</strong> — Does this repo look like real, intentional work? Rated on language, activity, description quality, and topic signals that indicate what stack and how deep.</p>
          </div>
          <div class="hiw-ai-legend-item">
            <span class="chip chip--ai">Prof. 60</span>
            <p><strong>Professionalism (1–100)</strong> — Would a stranger immediately understand what this repo is for? Rated on presentation quality: description clarity, whether it looks maintained, and whether it's something you'd link in a CV.</p>
          </div>
        </div>
        <div class="hiw-ai-chips">
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--danger">AI: consider deleting</span>
            <p>The AI thinks this adds noise to your profile — no description, no activity, no clear purpose.</p>
          </div>
          <div class="hiw-badge-row">
            <span class="badge-pill badge-pill--warn">AI: consider private</span>
            <p>The AI thinks it isn't ready for public consumption — could be a fork, experiment, or work in progress.</p>
          </div>
        </div>
        <p class="hiw-section__note">
          <strong>AI ratings are advisory only.</strong> The AI can be wrong. You make every decision and confirm every action before anything changes on GitHub.
        </p>
      </section>

      <!-- ACTIONS -->
      <section class="hiw-section hiw-section--actions">
        <h2 class="hiw-section__title">
          <svg class="hiw-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          Actions
        </h2>
        <div class="hiw-actions-grid">
          <div class="hiw-action-card">
            <div class="hiw-action-card__header">
              <svg class="hiw-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <h3 class="hiw-action-card__title">Make Private</h3>
            </div>
            <p>Hides the repo from public view. Code and history are preserved — only you can see it. Good for experiments or work in progress.</p>
          </div>
          <div class="hiw-action-card">
            <div class="hiw-action-card__header">
              <svg class="hiw-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <h3 class="hiw-action-card__title">Make Public</h3>
            </div>
            <p>Exposes the repo to the internet. <strong>Everything</strong> — code, commit history, file contents — becomes publicly visible. Check for secrets before doing this.</p>
          </div>
          <div class="hiw-action-card hiw-action-card--danger">
            <div class="hiw-action-card__header">
              <svg class="hiw-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              <h3 class="hiw-action-card__title">Delete</h3>
            </div>
            <p>Permanently removes the repo from GitHub. There is no undo. Enable the deletion toggle first, then select repos individually — there is no "delete all" by design.</p>
          </div>
        </div>
      </section>

      <div class="hiw-footer">
        <a routerLink="/" class="hiw-back">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="hiw-back-icon"><line x1="10" y1="4" x2="4" y2="8"/><line x1="4" y1="8" x2="10" y2="12"/></svg>
          Back to your repos
        </a>
      </div>

    </main>
  `,
  styles: []
})
export class HowItWorksComponent {}
