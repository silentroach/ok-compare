# Task 003 - Meetings content collections and raw schemas

## Goal

Add the external data contract for meetings and transcripts, using Astro build-time content collections and raw Zod schemas.

This task defines what editors can write. It should not build the full domain model or HTML page yet.

## Dependencies

None, but doing it after Task 002 keeps route names available for later tasks.

## Files Likely Touched

- `apps/www/src/content.config.ts`
- `apps/www/src/lib/meetings/raw-schema.ts`
- `apps/www/src/lib/meetings/raw-schema.test.ts`
- `apps/www/src/data/meetings/AGENTS.md`
- Maybe `apps/www/src/lib/meetings/schema.ts` if shared constants make raw schema clearer.

## Data Layout

Use this layout:

```text
apps/www/src/data/meetings/
  AGENTS.md
  [slug]/
    index.yaml
    transcript.yaml
```

The collection id for both files is `[slug]`, where slug is the directory name.

Allowed slug format:

- lower-case Latin letters.
- digits.
- hyphen separators.
- no slash inside slug.
- recommended first real slug: `2026-06-13-ok-comfort`.

## Collections

Add two collections in `apps/www/src/content.config.ts`:

- `meetingEntries` uses `glob({ pattern: '*/index.yaml', base: './src/data/meetings', generateId })`.
- `meetingTranscripts` uses `glob({ pattern: '*/transcript.yaml', base: './src/data/meetings', generateId })`.

The `generateId` function must validate path shape and slug. It should fail with a clear error if an entry is not exactly `[slug]/index.yaml` or `[slug]/transcript.yaml`.

Do not use a manual YAML parser. Astro `glob()` supports YAML files.

## Raw Meeting Schema

`RawMeetingSchema` should validate `index.yaml`.

Required fields:

- `title`: nonblank string, trimmed.
- `date`: supported site date input. Accept the same practical formats as news/status: `dd.mm.yyyy`, `dd.mm.yyyy hh:mm`, or `YYYY-MM-DD`.
- `context`: one short nonblank context phrase. This is not a summary/protocol.

Optional fields:

- `updated_at`: same date format as `date`, used later for sitemap/dateModified.
- `source_url`: absolute URL.

Do not add fields for decisions, action items, related news, agenda, protocol, video embed or iframe.

Use strict object validation for meeting metadata so unsupported fields fail loudly instead of being silently stripped.

## Raw Transcript Schema

`RawMeetingTranscriptSchema` should validate `transcript.yaml`.

Required root fields:

- `speakers`: record keyed by local speaker id.
- `segments`: non-empty array.

Speaker record values:

- known person speaker: object with `person` slug.
- local speaker: object with `name` string.
- exactly one of `person` or `name` must be present.

Use strict object validation for transcript root, speaker objects and segments. Extra fields should fail loudly because ADR-014 intentionally excludes protocol/editorial layers from meeting data.

Segment fields:

- `start`: required `HH:MM:SS` string.
- `end`: optional `HH:MM:SS` string.
- `speaker`: required local speaker id from `speakers`.
- `text`: required nonblank string. Trim only outer whitespace; preserve internal line breaks and rough speech.

Validation rules that can live in raw schema:

- Time minutes and seconds are `00` through `59`.
- Speaker ids use lower-case Latin letters, digits and hyphen.
- Transcript has at least one segment.
- `speakers` has at least one item.

Validation rules that can live in mapper if easier:

- Segment speaker exists in `speakers`.
- `end` is not earlier than `start`.
- Segment starts are non-decreasing.
- Known `person` speaker exists in the people registry.

## Data Editing Guide

Add `apps/www/src/data/meetings/AGENTS.md` with concise editor rules:

- One meeting per slug directory.
- `index.yaml` plus `transcript.yaml` are required.
- Do not create a meeting without transcript.
- Use `person` only for existing `/people/` profiles.
- Use local `name` for one-off speakers.
- Transcript `text` is plain text, not Markdown.
- Do not add protocol, decisions or editorial conclusions to meeting data.
- Links from news use ordinary Markdown links to `/meetings/[slug]/#t-HH-MM-SS`.

## Tests To Add

Add `apps/www/src/lib/meetings/raw-schema.test.ts`:

- Accepts a minimal valid meeting.
- Accepts a transcript with one local speaker and one person speaker.
- Rejects blank title/context/text.
- Rejects invalid URL.
- Rejects invalid time strings.
- Rejects a speaker object that has both `person` and `name`.
- Rejects a speaker object that has neither `person` nor `name`.
- Rejects unsupported meeting fields such as `decisions` or `protocol`.

## Acceptance Criteria

- [ ] `meetingEntries` and `meetingTranscripts` are exported from `collections`.
- [ ] Raw schemas validate the agreed YAML shape.
- [ ] Path validation fails clear errors for invalid meeting data paths.
- [ ] `apps/www/src/data/meetings/AGENTS.md` exists.
- [ ] No public pages, routes or loader are added in this task except collection registration.

## Verification

- [ ] Run `pnpm --filter @shelkovo/www test -- src/lib/meetings/raw-schema.test.ts`.
- [ ] Run `pnpm --filter @shelkovo/www typecheck` if content collection type generation changed enough to require it.

## Memory Updates

Record final collection names and final YAML field names in `memory.md`.

## Subagent Boundary

Subagent may implement and run focused tests. Subagent must not commit and must not mark `context.md` todo.
