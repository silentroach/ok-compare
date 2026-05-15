# Task: Reduce Critical Font Payload And Preloads

## Goal

Reduce render delay, FCP, and Speed Index by loading fewer critical font files before first paint.

## Lighthouse Finding

- Category: Performance.
- Affected URLs: all representative URLs, strongest impact on `/815/compare/` and `/815/regulation/`.
- Symptoms: FCP from `2.7s` to `2.9s` on heavy pages, LCP around `3.5s`, Speed Index around `4.7s` to `4.8s`.
- Network details show multiple Fira Sans and PT Sans Caption font files loaded early, including latin, latin-ext, and cyrillic subsets across several weights.

## Current Code

- `packages/ui/src/FontPreloads.astro` preloads four fonts on every page.
- `packages/ui/styles.css` imports PT Sans Caption `700` and Fira Sans `400`, `500`, `600`, `700`.
- `apps/www/src/layouts/BaseLayout.astro` includes `<FontPreloads />` globally.

## Proposed Work

- Audit which font weights and subsets are needed above the fold for each route family.
- Reduce global preloads to only fonts that are truly critical for first render.
- Consider route-level or component-level preloads only for pages that need a specific heading font immediately.
- Consider replacing broad `@fontsource` imports with subset-specific imports if package support allows it.
- Preserve `font-display` behavior from fontsource unless deliberately changing it.

## Acceptance Criteria

- [x] Global font preload count is reduced or justified with measured evidence.
- [x] Heavy pages show improved or unchanged FCP/LCP in Lighthouse.
- [x] No visible flash or layout shift regression is introduced.
- [x] Cyrillic text still renders with intended fonts.

## Verification

- [x] Run `pnpm build`.
- [x] Compare generated CSS/font asset requests before and after.
- [x] Run Lighthouse on `/815/compare/` and `/815/regulation/`.
- [x] Manually inspect Russian text rendering on `/`, `/news/`, and compare pages.

## Completion Notes

- Global font preloads reduced from 4 to 2: only critical Cyrillic `Fira Sans 400` and `PT Sans Caption 700` remain preloaded.
- Generated font assets reduced from 32 WOFF2 plus 32 WOFF files to 15 WOFF2 files; Greek, Vietnamese, Cyrillic Extended and WOFF fallback assets are no longer emitted.
- The shared CSS keeps `font-display: swap` and preserves Cyrillic, Latin and Latin Extended coverage for the weights used by the site.
- Final static Lighthouse CI on `/815/compare/` and `/815/regulation/` completed with remaining performance and Best Practices warnings; those are tracked by later Lighthouse tasks.
- Browser verification on `/`, `/news/` and `/815/compare/` confirmed `Fira Sans` body text and `PT Sans Caption` headings load for Russian text.

## Files Likely Touched

- `packages/ui/src/FontPreloads.astro`
- `packages/ui/styles.css`
- `apps/www/src/layouts/BaseLayout.astro` if preloads become route-aware.

## Risks

- Removing a needed preload may improve network score but worsen perceived font stability.
- Subset-specific imports can miss characters if content includes extended Cyrillic or symbols.
- Shared UI package changes affect every route in `apps/www`.
