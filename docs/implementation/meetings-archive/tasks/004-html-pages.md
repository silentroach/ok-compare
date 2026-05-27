---
status: completed
id: 004-html-pages
depends_on:
  - 002-domain-loader-public-dto
parallel_safe: true
---

# 004 HTML Pages

## Цель

Сделать человеческий HTML-интерфейс `/meetings/` и `/meetings/YYYY-MM-DD/[slug]/` как документный архив: сначала смысл, затем протокол, запись, transcript и источники.

## Skills

- `astro`
- `frontend-ui-engineering`
- `tailwind-design-system`
- `web-typography`
- `copy-editing`
- `browser-testing-with-devtools`
- `code-simplification`
- `code-review-and-quality`

## Обязательно прочитать

- `docs/implementation/meetings-archive/context.md`
- `docs/design/design-code-shelkovo.md`
- `docs/page-meta.md`
- `apps/www/src/pages/news/[year]/[month]/[entry]/index.astro`
- `apps/www/src/pages/status/index.astro`
- `apps/www/src/layouts/BaseLayout.astro`
- `apps/www/src/styles/site.css`

## Границы работы

- Create `apps/www/src/pages/meetings/index.astro`.
- Create `apps/www/src/pages/meetings/[date]/[slug]/index.astro`.
- Add small meeting components only when they reduce duplication.
- Do not add `/meetings/` to the main navigation.
- Do not implement client-side tabs unless a stable anchor fallback exists.
- Do not render iframe video until task `010` provides allowlist and CSP.

## UI Requirements

- Visual direction: flat field journal, strong typography, quiet dividers, low card weight.
- Index page lists meetings by date desc and works when list is empty.
- Detail page has stable anchors `#summary`, `#protocol`, `#recording`.
- Timecode anchors use transcript/protocol anchors like `#t-00-12-34`.
- Empty sections are hidden; no fake empty tabs.
- Summary block appears when any editorial summary/highlight/decision/open question exists.
- Protocol section appears only when agenda, decisions, action items, questions or disputed points exist.
- Recording section appears only when `videoUrl`, allowed embed or transcript exists.
- Video link never dominates the page over summary and protocol.
- Long transcript is readable but visually secondary.
- Metadata includes date, format, participants and source only when present.
- Page titles and descriptions follow `docs/page-meta.md`.

## Accessibility

- Landmarks and headings are ordered logically.
- Sticky local navigation, if added, remains keyboard usable.
- Timecode links have meaningful accessible labels.
- External recording/source links are distinguishable from internal anchors.
- Color is not the only carrier of meaning.

## Acceptance Criteria

- Detail page renders a minimal meeting without empty protocol/recording/source blocks.
- Detail page renders a full meeting with protocol, documents, recording link and transcript anchors.
- No public fake meeting is required for build; tests can use fixtures or component-level data.
- Mobile layout stays readable without horizontal overflow.
- There is no main-menu link to `/meetings/`.

## Verification

- `pnpm --filter @shelkovo/www test -- src/components src/lib/meetings`
- `pnpm --filter @shelkovo/www typecheck`
- If a dev server is already running or the user asks for it, use browser testing to inspect `/meetings/` and one detail page.

## Completion Protocol

- Run `code-simplification` after tests are green.
- Run `code-review-and-quality` before commit.
- Update this file status to `completed` with a short completion note.
- Update `docs/implementation/meetings-archive/context.md` task checkbox.
- Commit only files touched for this task.

## Completion Notes

- Added `/meetings/` and `/meetings/YYYY-MM-DD/[slug]/` HTML pages backed by the meetings domain loader.
- Added meeting list/detail Astro components with optional summary/protocol/recording sections, transcript timecode anchors and non-iframe recording links.
- Added focused component/view tests and updated route-cache coverage for the new HTML route family.
- Verification passed: `pnpm --filter @shelkovo/www test -- src/components src/lib/meetings`; `pnpm --filter @shelkovo/www typecheck`.
