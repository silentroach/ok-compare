# Task 010 - News links to meeting and transcript anchors

## Goal

Add editorial links from news to the meeting page and, where useful, to exact transcript anchors.

ADR-014 explicitly says news and other materials should use normal Markdown links to `/meetings/[slug]/#t-HH-MM-SS`. Do not add a typed meeting mention syntax.

## Dependencies

- Task 009 must be complete with a real meeting slug and final anchors.

## Skills

Load before implementation:

- `news-maker`
- `copy-editing`
- `web-typography`

`news-maker` is mandatory before editing anything under `apps/www/src/data/news`.

## Files Likely Touched

- Existing news article such as `apps/www/src/data/news/articles/2026/05/ok-meeting-june.md` if a small source link update is editorially correct.
- Or a new post-meeting article under `apps/www/src/data/news/articles/YYYY/MM/[entry].md` if the meeting needs an explanatory news item.
- Possibly no news file if there is no editorial use yet. In that case record the reason in `memory.md`.

## Editorial Rules

- News explains; meetings prove.
- Do not move transcript content into news.
- Do not turn the meeting page into protocol by linking every claim.
- Add only links that help the reader verify a specific quote, claim or source.
- Use natural Markdown links: `[в транскрипции встречи](/meetings/2026-06-13-ok-comfort/#t-00-12-34)`.
- If linking to the whole meeting, use `/meetings/[slug]/`.
- If linking to a fragment, use the exact generated anchor.
- If the news text mentions people, continue to use people mention rules from `apps/www/AGENTS.md`.

## Choosing Existing Vs New News

Use existing pre-event article only for a minimal update if it remains historically accurate.

Prefer a new post-event news article when:

- The meeting happened and there are new facts to explain.
- The article needs conclusions or context that should not live in the transcript page.
- The existing pre-event article would become misleading if rewritten.

Do not create a news article only to test links.

## Acceptance Criteria

- [ ] News links use normal Markdown URLs.
- [ ] No meeting mention syntax is introduced.
- [ ] Links point to existing meeting page and existing anchors.
- [ ] News still follows `news-maker` frontmatter and editorial rules.
- [ ] Build fails if a people mention is invalid; fix source data rather than bypassing mention checks.

## Verification

- [ ] Run the checks recommended by `news-maker`.
- [ ] Run `pnpm --filter @shelkovo/www test -- src/lib/news src/lib/meetings` if news and meetings code are both touched.
- [ ] Run `pnpm --filter @shelkovo/www typecheck`.
- [ ] Run `pnpm --filter @shelkovo/www build` if a public news page changed.

## Memory Updates

Record news files changed and anchors used in `memory.md`.

## Subagent Boundary

Subagent may edit news only after loading `news-maker`. Subagent must not commit and must not mark `context.md` todo.
