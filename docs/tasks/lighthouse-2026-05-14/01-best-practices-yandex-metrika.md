# Task: Handle Yandex Metrika Best Practices Noise

## Goal

Decide how the site should handle the Lighthouse Best Practices failure caused by Yandex Metrika third-party cookies without accidentally removing production analytics.

## Lighthouse Finding

- Category: Best Practices.
- Current score: `79` on representative runs.
- Failing audits: `third-party-cookies`, `inspector-issues`.
- Affected URLs: `/`, `/news/`, `/status/`, `/815/compare/`, `/815/compare/rating/`, `/815/regulation/`.
- Reported sources include `https://mc.yandex.ru/metrika/tag.js`, `https://mc.yandex.com/watch/...`, and Yandex sync-cookie endpoints.

## Current Code

- `apps/www/src/layouts/BaseLayout.astro` injects deferred Metrika in production.
- `apps/www/src/layouts/BaseLayout.astro` also includes the `<noscript>` tracking image.
- `ops/nginx/kpshelkovo-online.conf` allows Yandex Metrika origins in CSP.
- `lighthouserc.cjs` asserts `categories:best-practices` with `minScore: 0.9`.

## Proposed Work

- Confirm whether production Lighthouse should measure the real production page with Metrika enabled or a privacy/performance profile with analytics disabled.
- If Metrika must stay in production Lighthouse, document this as an accepted external-service limitation and adjust Lighthouse CI assertions to avoid recurring unactionable warnings.
- If CI should focus on first-party quality, add an explicit `LIGHTHOUSE_DISABLE_ANALYTICS` or equivalent build/runtime path for static Lighthouse runs only.
- Keep production analytics behavior unchanged unless there is a separate product decision to remove or replace Metrika.
- Ensure Lighthouse summary still reports the Metrika finding when present, even if the assertion no longer blocks or warns.

## Acceptance Criteria

- [ ] The repository documents whether Metrika third-party cookies are accepted, suppressed in CI, or avoided for Lighthouse-only runs.
- [ ] Lighthouse CI no longer creates ambiguous Best Practices warnings without an explanation.
- [ ] Production pages still load Metrika when the agreed production behavior requires it.
- [ ] CSP remains aligned with the chosen Metrika behavior.

## Verification

- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm build` if layout, env handling, or generated pages change.
- [ ] Run Lighthouse against one affected URL with the chosen target and verify Best Practices behavior matches the documented decision.
- [ ] Inspect the generated HTML for `mc.yandex.ru` only in the intended mode.

## Files Likely Touched

- `apps/www/src/layouts/BaseLayout.astro`
- `lighthouserc.cjs`
- `.github/workflows/lighthouse.yml`
- `ops/nginx/kpshelkovo-online.conf`
- `docs/tasks/lighthouse-2026-05-14/01-best-practices-yandex-metrika.md` or a follow-up ADR if the decision is architectural.

## Risks

- Removing or delaying analytics further can affect business reporting.
- Suppressing the audit too broadly can hide future third-party regressions.
- Changing CSP for Metrika can break tracking silently.
