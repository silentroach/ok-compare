# Task: Improve Lighthouse CI Summary And Assertions

## Goal

Make Lighthouse CI output actionable by listing the specific failing audits and distinguishing accepted external/tooling warnings from regressions.

## Current Problem

- `.github/workflows/lighthouse.yml` summary only prints category scores.
- Repeated known issues require opening JSON/HTML artifacts to understand root causes.
- `lighthouserc.cjs` asserts broad category scores, which can warn on accepted trade-offs like Metrika cookies or `Content-Signal` in `robots.txt`.

## Current Code

- `.github/workflows/lighthouse.yml` has a Node script that reads `.lighthouseci/manifest.json` and prints a category-score table.
- `lighthouserc.cjs` sets minimum category scores for performance, accessibility, best practices, and SEO.

## Proposed Work

- Extend the summary script to list weighted failing audits per representative URL.
- Include audit IDs, titles, scores, display values, and the most relevant item URLs/selectors where available.
- Add a known-issues section for accepted findings such as `Content-Signal` in `robots.txt`, if task `02` decides to keep it accepted.
- Revisit assertions so CI warns on actionable regressions, not known policy/tooling conflicts.
- Avoid markdown tables in repo docs, but GitHub step summary can keep its current compact table if desired.

## Acceptance Criteria

- [ ] Lighthouse workflow summary shows specific failing audits, not only category scores.
- [ ] Known accepted issues are clearly labeled and do not obscure new failures.
- [ ] Assertions remain strict for actionable accessibility and performance regressions.
- [ ] The artifact upload behavior remains unchanged.

## Verification

- [ ] Run the summary script locally against `lighthouse-reports/` or `.lighthouseci/` fixtures.
- [ ] Run `pnpm typecheck` if shared scripts or typed utilities are introduced.
- [ ] Run the Lighthouse workflow manually or test the Node summary logic in isolation.

## Files Likely Touched

- `.github/workflows/lighthouse.yml`
- `lighthouserc.cjs`
- Optional helper script under `scripts/` if the inline workflow script becomes too large.

## Risks

- Making the workflow script too complex inline can reduce maintainability.
- Suppressing by category can hide real regressions; prefer audit-level handling.
- Known-issue matching must be specific enough to avoid hiding unrelated `robots.txt` or third-party issues.
