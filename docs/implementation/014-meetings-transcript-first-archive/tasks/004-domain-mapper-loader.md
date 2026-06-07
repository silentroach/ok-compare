# Task 004 - Meetings domain model, transcript mapper and loader

## Goal

Translate raw meeting and transcript collection entries into a readonly domain model with resolved speakers, deterministic transcript anchors and cached loaders.

This is the core build-time data layer for `/meetings/[slug]/`.

## Dependencies

- Task 003 must be complete.
- Task 002 is strongly recommended because route helpers are needed for URLs.

## Files Likely Touched

- `apps/www/src/lib/meetings/types.ts`
- `apps/www/src/lib/meetings/mapper.ts`
- `apps/www/src/lib/meetings/load.ts`
- `apps/www/src/lib/meetings/date.ts` if a local date wrapper is useful.
- `apps/www/src/lib/meetings/mapper.test.ts`
- `apps/www/src/lib/meetings/load.test.ts`

## Domain Model

Create handwritten readonly TypeScript interfaces. Do not use `z.infer` as the domain model.

Recommended domain interfaces:

- `MeetingMoment`: `at`, `iso`, `hasTime`.
- `MeetingSpeaker`: `id`, `kind`, `label`, optional `personSlug`, optional `url`.
- `MeetingTranscriptSegment`: `anchor`, `start`, optional `end`, `speakerId`, `speaker`, `text`.
- `Meeting`: `id`, `slug`, `title`, `date`, optional `updatedAt`, `context`, optional `sourceUrl`, `url`, `canonical`, `transcript`.
- `MeetingTranscript`: `speakers`, `segments`.
- `MeetingsDataset`: `meetings`, `bySlug`.

Use `readonly` for all properties and `readonly T[]` or `ReadonlyMap` for collections.

## Date Handling

Use the same accepted date formats as existing site content.

Preferred approach:

- Create a tiny `apps/www/src/lib/meetings/date.ts` wrapper around the existing parser if that keeps meeting code readable.
- Do not move or redesign the shared news/status date parsers in this task.

The mapper should validate:

- `date` parses successfully.
- `updated_at`, when present, parses successfully.
- `updated_at` is not earlier than `date` if both are present.

## Transcript Time Handling

Implement a small parser for `HH:MM:SS` transcript times.

Store enough normalized data to support:

- anchor generation.
- display as original normalized `HH:MM:SS`.
- comparing `start` and `end` by total seconds.

The domain can store transcript time as a string plus `totalSeconds`, or as a small readonly object. Choose the smallest readable option.

## Speaker Resolution

Mapper receives a `SiteMentionRegistry`.

Rules:

- If raw speaker has `person`, lookup that slug in the registry.
- If the slug is missing or is not a person target, throw a clear build error.
- Use the registry label and html URL for known person display.
- If raw speaker has `name`, create a local speaker with that name and no URL.
- Do not create new people records from local names.
- Do not add transcript speakers to people backlinks in this task.

## Segment Mapping

Mapper validates:

- Every segment speaker id exists in `speakers`.
- `end` is not earlier than `start`.
- Segment starts are non-decreasing by total seconds.
- Duplicate start times are allowed.
- Segment `text` remains plain text.

Anchor generation:

- `00:12:34` -> `t-00-12-34`.
- First occurrence has no suffix.
- Second occurrence gets `-2`.
- Third occurrence gets `-3`.
- Suffixes are based on segment order after validation, not on object key order.

## Dataset Loader

Add `buildMeetingsDataset(entries, transcripts, opts)` and loaders.

Expected exports:

- `buildMeetingsDataset` for tests.
- `loadMeetingsData()` returning cached `MeetingsDataset`.
- `loadMeetings()` returning `readonly Meeting[]`.
- `loadMeeting(slug: string)` returning `Meeting | undefined`.

Loader implementation:

- Use `getCollection('meetingEntries')` and `getCollection('meetingTranscripts')`.
- Use `loadPeopleMentionRegistry()` for person speaker resolution.
- Reject a meeting entry without matching transcript.
- Reject an orphan transcript without matching meeting entry.
- Sort meetings by date descending, then title or slug using `compareRuText` for deterministic order.
- Cache the dataset with a module-level `Promise<MeetingsDataset> | undefined`, following `news/load.ts` and `status/load.ts`.

## Tests To Add

Mapper tests:

- Maps a minimal meeting with local speaker.
- Resolves a person speaker through `createPersonMentionTarget`.
- Rejects unknown person speaker.
- Rejects segment with unknown speaker id.
- Rejects `end` earlier than `start`.
- Rejects decreasing segment starts.
- Generates duplicate anchors with deterministic suffixes.
- Keeps transcript text plain and does not normalize `@slug` mentions inside segment text.

Loader tests:

- Joins meeting entries with transcripts by id.
- Rejects missing transcript.
- Rejects orphan transcript.
- Sorts meetings newest first.
- `loadMeeting` trims/validates empty slug the same way nearby loaders do.

## Acceptance Criteria

- [ ] Domain types are handwritten and readonly.
- [ ] Raw DTO shape does not leak into page/UI code.
- [ ] Build-time dataset includes canonical URL and site URL helpers.
- [ ] Transcript anchors are deterministic and covered by tests.
- [ ] Person speaker lookup uses the existing people mention registry.
- [ ] Transcript text is not processed as Markdown mentions.

## Verification

- [ ] Run `pnpm --filter @shelkovo/www test -- src/lib/meetings/mapper.test.ts src/lib/meetings/load.test.ts`.
- [ ] Run `pnpm --filter @shelkovo/www typecheck` if collection types or loader types changed.

## Memory Updates

Record final exported loader names, domain type names and anchor helper behavior in `memory.md`.

## Subagent Boundary

Subagent may implement and run focused tests. Subagent must not commit and must not mark `context.md` todo.
