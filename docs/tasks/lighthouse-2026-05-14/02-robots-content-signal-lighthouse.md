# Task: Preserve Content-Signal While Handling Lighthouse Robots Warning

## Goal

Keep the `Content-Signal` directive in `robots.txt` and make the Lighthouse SEO warning intentional, documented, and non-confusing.

## Lighthouse Finding

- Category: SEO.
- Current score: `92` on all representative runs.
- Failing audit: `robots-txt`.
- Error: line 3, `Content-Signal: ai-train=yes, search=yes, ai-input=yes`, `Unknown directive`.
- Affected URLs: all representative URLs because Lighthouse fetches the same root `robots.txt`.

## Product Constraint

Do not remove `Content-Signal` from `robots.txt`.

The directive is intentional and should be treated as a site policy signal. See `https://contentsignals.org/`, which describes Content Signals as an up-to-date guide to the IETF proposed AI Preferences (`aipref`) mechanism for publisher control over automated use of content.

## Current Code

- `apps/www/src/pages/robots.txt.ts` emits `Content-Signal: ai-train=yes, search=yes, ai-input=yes`.
- `lighthouserc.cjs` asserts `categories:seo` with `minScore: 0.9`, which currently still passes but carries a persistent warning.
- `.github/workflows/lighthouse.yml` summary only shows scores, so the reason for SEO `92` is not visible without opening the report.

## Proposed Work

- Preserve the `Content-Signal` line exactly unless the content policy itself changes.
- Add a short code comment in `robots.txt.ts` explaining that the directive is intentional and may be unknown to Lighthouse.
- Improve Lighthouse CI summary so `robots-txt` is listed as an accepted known issue when the only failing line is `Content-Signal`.
- Consider targeted LHCI assertion handling for `robots-txt`, but avoid hiding unrelated `robots.txt` syntax errors.
- Add or update a test that verifies `robots.txt` includes `Content-Signal` and `Sitemap`.

## Acceptance Criteria

- [ ] `robots.txt` still contains `Content-Signal: ai-train=yes, search=yes, ai-input=yes`.
- [ ] Future maintainers can see why the Lighthouse robots warning is accepted.
- [ ] Lighthouse summary distinguishes the known `Content-Signal` warning from other `robots.txt` errors.
- [ ] A regression test protects the intentional directive.

## Verification

- [ ] Run the relevant `robots.txt` test or add one if none exists.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm build`.
- [ ] Run a Lighthouse check and confirm the warning is either clearly summarized as accepted or no longer treated as actionable.

## Files Likely Touched

- `apps/www/src/pages/robots.txt.ts`
- `apps/www/src/lib/route-cache-coverage.test.ts` or a new route/output test
- `.github/workflows/lighthouse.yml`
- `lighthouserc.cjs`

## Risks

- Fully disabling `robots-txt` in Lighthouse can hide real crawler-control mistakes.
- Lighthouse may continue to show SEO `92`; the task is about intentional handling, not deleting the policy signal to chase a score.
