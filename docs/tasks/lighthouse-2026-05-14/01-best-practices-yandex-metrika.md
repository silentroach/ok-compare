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

- [x] The repository documents whether Metrika third-party cookies are accepted, suppressed in CI, or avoided for Lighthouse-only runs.
- [x] Lighthouse CI no longer creates ambiguous Best Practices warnings without an explanation.
- [x] Production pages still load Metrika when the agreed production behavior requires it.
- [x] CSP remains aligned with the chosen Metrika behavior.

## Resolution

- Decision recorded in `docs/decisions/004-lighthouse-analytics-profile.md`.
- Production keeps Yandex Metrika enabled; production CSP remains unchanged because Metrika origins are still required.
- Scheduled/static Lighthouse builds use `LIGHTHOUSE_DISABLE_ANALYTICS=true`, so CI focuses on first-party quality without Metrika third-party-cookie noise.
- Production Lighthouse target keeps analytics enabled and uses a lower Best Practices threshold for the accepted external-service limitation; the workflow summary now calls out Metrika findings when present.

## Verification

- [x] Run `pnpm typecheck`.
- [x] Run `pnpm build` if layout, env handling, or generated pages change.
- [x] Run Lighthouse against one affected URL with the chosen target and verify Best Practices behavior matches the documented decision.
- [x] Inspect the generated HTML for `mc.yandex.ru` only in the intended mode.

Verification results, 2026-05-15:

- `pnpm typecheck` passed.
- `LIGHTHOUSE_DISABLE_ANALYTICS=true pnpm build` passed; generated `dist/www` had no `mc.yandex.*` references.
- `LIGHTHOUSE_SITE_TARGET=static LIGHTHOUSE_DISABLE_ANALYTICS=true pnpm exec lhci autorun` passed with Best Practices `100` on representative static runs. It still reported existing unrelated warnings for `/status/` accessibility `90 < 95` and `/815/compare/` performance `84 < 85`.
- The Lighthouse summary script was run locally against the current `.lighthouseci` reports and printed `Analytics: disabled` with Best Practices `100` for all representative static URLs.
- Default `pnpm build` passed after verification; generated `dist/www` includes `mc.yandex.ru`, confirming production analytics remain enabled.

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
