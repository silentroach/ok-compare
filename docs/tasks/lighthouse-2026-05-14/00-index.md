# Lighthouse Follow-Up Tasks, 2026-05-14

## Context

The Lighthouse reports in `lighthouse-reports/` show repeated issues across representative runs for `https://kpshelkovo.online/`, `/news/`, `/status/`, `/815/compare/`, `/815/compare/rating/`, and `/815/regulation/`.

These files break the findings into independent implementation tasks. Each task is intended to be small enough for a focused engineering session and includes acceptance criteria plus verification steps.

## Source Reports

- `lighthouse-reports/manifest.json`
- `lighthouse-reports/assertion-results.json`
- Representative report JSON files under `lighthouse-reports/*.report.json`

## Tasks

- `01-best-practices-yandex-metrika.md`: decide how to handle Yandex Metrika third-party cookies in Lighthouse Best Practices.
- `03-news-pinned-icon-aria.md`: fix prohibited ARIA on the pinned news icon.
- `04-status-timeline-aria.md`: fix prohibited ARIA on non-link status timeline segments.
- `05-status-timeline-touch-targets.md`: make status timeline interactive targets accessible on touch.
- `06-status-heading-order.md`: restore sequential heading order on `/status/`.
- `07-compare-color-contrast.md`: fix compare page badge/count contrast.
- `08-rating-color-contrast.md`: fix rating page adjustment label contrast.
- `09-critical-font-loading.md`: reduce critical font payload and preloads.
- `10-status-timeline-js.md`: reduce unused status timeline JavaScript.
- `11-compare-dom-size.md`: reduce initial DOM size on `/815/compare/`.
- `12-regulation-dom-size.md`: reduce initial DOM size on `/815/regulation/`.
- `13-security-csp-inline.md`: harden CSP away from broad inline/script allowlists.
- `14-security-hsts.md`: decide and roll out stronger HSTS.
- `15-security-coop.md`: decide whether to add COOP/origin isolation.
- `16-lighthouse-ci-summary-and-thresholds.md`: improve Lighthouse CI summaries and assertions.

## Suggested Order

- Start with low-risk correctness tasks: `03`, `04`, `06`, `07`, `08`.
- Then improve CI observability: `16`.
- Then tackle performance work: `09`, `10`, `11`, `12`.
- Handle security header changes last because they need deliberate browser compatibility and third-party integration checks: `13`, `14`, `15`.

## Global Verification

- Run `pnpm typecheck` after code changes.
- Run relevant tests for modified modules.
- Run `pnpm build` when routes, Astro pages, generated assets, or nginx-facing output change.
- Re-run Lighthouse CI or a targeted Lighthouse run before closing the related task.
