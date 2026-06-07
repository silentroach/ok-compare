# Task 006 - `/meetings/[slug]/` Astro detail page

## Goal

Add the canonical HTML page for one meeting transcript at `/meetings/[slug]/`.

The page must be a transcript source document, not a full editorial meeting page.

## Dependencies

- Task 002 must be complete.
- Task 004 must be complete.
- Task 005 must be complete.

## Skills

Load these before implementation:

- `frontend-ui-engineering`
- `tailwind-design-system`
- `web-typography`
- `astro`

## Files Likely Touched

- `apps/www/src/pages/meetings/[slug]/index.astro`
- Maybe `apps/www/src/components/meetings/TranscriptSegment.astro` if the page becomes too large.
- Maybe `apps/www/src/lib/meetings/seo.ts` if schema generation is clearer outside the page.

## Route Behavior

Use Astro static generation:

- `getStaticPaths` loads `loadMeetings()`.
- It returns `params: { slug: meeting.slug }`.
- Page validates `Astro.params.slug`.
- Page loads `loadMeeting(slug)` and throws if not found.

Do not add `src/pages/meetings/index.astro`.

Do not add `index.md.ts` or any endpoint under `/meetings/`.

## Page Layout

Use established root-site shell:

- `BaseLayout`.
- `Breadcrumbs` from `@shelkovo/ui/Breadcrumbs.astro`.
- `withHomeBreadcrumbs` and `withHomeSchemaBreadcrumbs`.
- `<main class="ui-page pb-8 md:pb-12 lg:pb-14">`.
- `<header class="ui-page-header">`.
- `<div class="ui-page-header-stack max-w-4xl">`.
- `<h1 class="ui-page-title">`.

Breadcrumbs:

- Home.
- `Архив встреч` as text without href because `/meetings/` does not exist.
- Current meeting title.

Header content:

- H1: meeting title.
- Date.
- Context phrase.
- Source link if `sourceUrl` exists.

Transcript section:

- One heading like `Транскрипция`.
- A short helper sentence may explain that anchors are tied to time, not line numbers.
- Ordered or unordered list of transcript segments.
- Each segment has `id={segment.anchor}`.
- Each segment has `scroll-mt-*` or equivalent so anchor jumps are readable under sticky browser/header contexts.
- Timestamp is a self-link to `#anchor`.
- Speaker label is visible before text.
- Known person speaker label links to `/people/[slug]/` through resolved URL.
- Local speaker label is plain text.
- Transcript text uses the safe helper from Task 005.

## Visual Direction

Follow `docs/design/design-code-shelkovo.md`:

- Flat source document, no heavy card grid.
- Long text measure around 65-75ch.
- Timestamps are utility links, not CTA chips.
- Use `text-muted-foreground`, `border-border`, `surface-muted` only where they improve scanning.
- Avoid gradients, big decorative callouts and media-player layout.
- Keep mobile first and readable at 320px.

Suggested segment pattern:

- Left/top meta row with timestamp and speaker.
- Text block below or beside it depending on viewport.
- Thin top border between segments.
- No nested cards per segment.

## SEO And Schema

Use page metadata:

- Title: `${meeting.title} — Архив встреч — Шелково Онлайн`, following `docs/page-meta.md`.
- Description from `describeMeeting(meeting)`.
- Canonical: `meeting.canonical`.
- `type="article"`.
- Keywords can be minimal: `['архив встреч Шелково', meeting.title]`.
- Schema can use `techArticleSchema` with `datePublished` and optional `dateModified`.

Do not add a new schema type unless there is a strong reason.

## Accessibility

- Maintain heading order: H1, H2, optional H3 only if needed.
- Timestamp self-links need accessible labels like `Ссылка на фрагмент 00:12:34`.
- Source link text must be meaningful, not just raw URL.
- Known person speaker links must have visible text.
- No interactive element should be a `div` with click handler. This page should need no client JS.

## Tests And Verification

Astro page tests may be covered by build/typecheck rather than a direct page unit test.

Focused checks:

- If there is no real meeting data yet, create unit-test fixtures in domain/view tests, not fake public data.
- After real data exists, build output should include `/meetings/[slug]/index.html`.

## Acceptance Criteria

- [ ] `/meetings/[slug]/index.astro` exists and uses `getStaticPaths`.
- [ ] No `/meetings/` index exists.
- [ ] Page renders title, date, context, optional source and transcript segments.
- [ ] Segment IDs match domain anchors.
- [ ] Timestamp self-links point to stable anchors.
- [ ] Person speakers link to people profiles; local speakers do not require people profiles.
- [ ] Transcript text is safe escaped HTML or plain escaped text.
- [ ] No iframe/embed/client JS is introduced.

## Verification

- [ ] Run `pnpm --filter @shelkovo/www typecheck`.
- [ ] Run `pnpm --filter @shelkovo/www build` after at least one meeting data item exists, or defer full page output verification until Task 009.

## Memory Updates

Record final page file path and any important markup decisions in `memory.md`.

## Subagent Boundary

Subagent may implement and run focused checks. Subagent must not commit and must not mark `context.md` todo.
