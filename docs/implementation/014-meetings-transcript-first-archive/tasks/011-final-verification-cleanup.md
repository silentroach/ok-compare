# Task 011 - Full verification, simplification and final commit hygiene

## Goal

Verify the transcript-first meetings MVP end to end, simplify code after implementation, update task state and ensure commits are clean.

This task is for the supervising agent after implementation tasks are done or intentionally blocked.

## Dependencies

- All non-blocked tasks must be complete.
- Task 009 and Task 010 can remain blocked only if real transcript/source material is unavailable. If blocked, state that clearly in `context.md` and `memory.md`.

## Skills

Load before final review:

- `code-simplification`
- `code-review-and-quality`

If visible UI was changed, also revisit:

- `frontend-ui-engineering`
- `web-typography`

## Review Checklist

Review code against these invariants:

- Only `/meetings/[slug]/` exists for meetings MVP.
- No `/meetings/` index route exists.
- No meetings Markdown endpoint exists.
- No meetings JSON/feed/schema/openapi/llms/api-catalog endpoint exists.
- Public Surface Registry has meetings detail route pattern.
- Root API catalog has no empty linkset entry and no meetings detail item.
- Transcript data uses raw schema -> mapper -> readonly domain model.
- Transcript text is not mention-normalized and is safely escaped before HTML insertion.
- Person speakers resolve through people registry.
- Local speakers do not require people profiles.
- Anchors are deterministic and duplicate starts get suffixes.
- Nginx serves meetings detail pages with HTML cache and no `Accept` negotiation.
- Sitemap includes concrete meeting detail pages when data exists, not `/meetings/`.

## Commands

Run final checks from repo root:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Do not run `pnpm dev` unless the user explicitly asks.

If a command fails:

- Investigate root cause.
- Fix implementation if in scope.
- Re-run the failing command.
- Record persistent gotchas in `memory.md`.

## Build Artifact Inspection

After `pnpm build`, if at least one real meeting exists:

- Confirm `dist/www/meetings/[slug]/index.html` exists.
- Confirm the HTML contains expected segment ids like `id="t-00-12-34"`.
- Confirm no `/meetings/index.html` exists unless a future decision changed MVP scope.
- Confirm sitemap output includes the concrete meeting URL.

Use file reads or targeted searches. Do not edit generated `dist` files.

## Context And Memory Updates

Update `context.md` todo:

- Mark completed tasks with `[x]` only after implementation and verification are done.
- Leave blocked tasks unchecked and add a short blocker note under `Blockers And Open Questions`.

Update `memory.md`:

- Add final route/data/helper names if not already recorded.
- Add final meeting slug and anchor facts if real data was published.
- Add commit hashes after commits.

## Commit Hygiene

Before each commit:

- Run `git status`.
- Run `git diff`.
- Run `git log --oneline -10`.
- Stage only intended files.
- Do not stage unrelated user changes.
- Do not amend prior commits unless the user explicitly asks.
- Do not push unless the user explicitly asks.

Commit message style:

- Use a concise imperative or descriptive message matching nearby repo style.
- Good examples: `Add transcript-first meetings data model`, `Register meetings public surface`, `Add meetings HTML cache coverage`.

## Acceptance Criteria

- [ ] All non-blocked tasks in `context.md` are complete.
- [ ] All final commands pass or failures are documented with clear external blockers.
- [ ] `code-simplification` review did not find unnecessary complexity, or fixes were applied.
- [ ] `code-review-and-quality` findings are resolved or explicitly documented.
- [ ] Working tree contains only intended remaining changes or is clean after commits.
- [ ] User can see what was implemented, what remains blocked and why.

## Subagent Boundary

This is a supervising-agent task. Do not delegate the final commit decision. You may delegate narrow investigation, but you must review all final diffs yourself.
