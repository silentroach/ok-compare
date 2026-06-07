# Task 009 - First real meeting transcript data

## Goal

Publish the first real meeting transcript as public meeting data after a real transcript and source are available.

Do not fabricate transcript content. If no transcript/source is available, leave this task blocked and record the blocker in `memory.md`.

## Dependencies

- Task 003 must be complete.
- Task 004 must be complete.
- Task 006 must be complete.
- Task 007 should be complete so sitemap metadata works for real data.

## Skills

Load before implementation:

- `copy-editing` for the short visible context phrase only.
- `web-typography` if transcript formatting choices need review.

Do not use copy-editing to rewrite the transcript into editorial prose. Transcript cleanup is limited to obvious recognition errors, typos and unreadable places.

## Files Likely Touched

- `apps/www/src/data/meetings/[slug]/index.yaml`
- `apps/www/src/data/meetings/[slug]/transcript.yaml`
- Maybe `apps/www/src/data/people/*.md` only if the implementation truly needs a new public person profile.

## Candidate First Meeting

The existing news article `apps/www/src/data/news/articles/2026/05/ok-meeting-june.md` announces a 13 June 2026 ОК Комфорт meeting.

Recommended slug if this is the first transcript:

```text
2026-06-13-ok-comfort
```

Use a different slug only if the real source makes another slug clearly better. If changed, write the final slug to `memory.md` before adding news links in Task 010.

## Required Source Inputs

Before creating public data, confirm there is a real source for:

- Meeting title.
- Meeting date and time if known.
- Context phrase.
- Source URL or recording URL if available.
- Transcript text with enough timing to create segment starts.
- Speaker identification, at least local names or roles.

If timing is missing entirely, do not publish in this MVP because ADR-014 requires stable time-based anchors.

## Metadata Rules

`index.yaml`:

- `title` is a neutral meeting title.
- `date` is the meeting date, with time if known.
- `context` is one short orientation phrase, not conclusions.
- `source_url` points to the original source/recording if available.
- `updated_at` is optional and should be used when transcript is corrected after first publication.

Do not add protocol, decisions, action items, open questions, agenda or related news fields.

## Speaker Rules

`transcript.yaml` speaker keys are local to this transcript.

Use `person` only when:

- The person already exists under `apps/www/src/data/people`.
- Or there is a real public need to add a person profile beyond this one transcript.

Use `name` for:

- One-off residents.
- Roles or speakers that do not need a public profile.
- Unidentified speakers, with labels like `Житель` or `Представитель ОК`, if that is the most honest label.

Do not create a `/people/` profile only to make one transcript speaker clickable.

## Segmentation Rules

Segment for verifiability and reading:

- Start a new segment when speaker changes.
- Start a new segment at meaningful topic/time breaks if one speaker talks for a long time.
- Prefer segments that are not massive walls of text.
- Preserve rough speech where it matters.
- Fix obvious ASR errors and typos only when the intended words are clear.
- Mark unclear places honestly in transcript text, for example `[неразборчиво]`, if needed.

Timing rules:

- Every segment needs `start` as `HH:MM:SS`.
- Use `end` when known.
- Segment starts must be non-decreasing.
- Duplicate starts are allowed but should be rare.

## Anchor QA

After adding data:

- Build the dataset or page.
- Check generated anchors for several important transcript moments.
- Confirm no duplicate HTML ids after suffixing.
- If a news link will target a segment, copy the final anchor from generated/domain output, not from manual guesswork.

## Acceptance Criteria

- [ ] Real meeting directory exists with `index.yaml` and `transcript.yaml`.
- [ ] No fake or placeholder transcript is published.
- [ ] Data validates through content collections and domain loader.
- [ ] Known people speakers resolve through existing people profiles.
- [ ] Local speakers do not require people profiles.
- [ ] Transcript segment anchors are stable and deterministic.
- [ ] Page builds for the meeting slug.

## Verification

- [ ] Run `pnpm --filter @shelkovo/www test -- src/lib/meetings`.
- [ ] Run `pnpm --filter @shelkovo/www typecheck`.
- [ ] Run `pnpm --filter @shelkovo/www build`.
- [ ] If build succeeds, inspect generated `dist/site/meetings/[slug]/index.html` inside `apps/www` or `dist/www/meetings/[slug]/index.html` after root build, depending on command used.

## Memory Updates

Record:

- Final meeting slug.
- Source URL.
- Any known caveats about transcript quality.
- Any anchors that later news should link to.

## Subagent Boundary

Subagent may add real data only when source material is present. Subagent must not commit and must not mark `context.md` todo.
