# Task 005 - Transcript view helpers and safe typography

## Goal

Add presentation helpers for meeting pages, especially safe transcript text formatting.

Transcript segment text comes from YAML and is plain text. It must never be inserted as raw HTML unless it has been escaped first.

## Dependencies

- Task 004 must be complete.

## Files Likely Touched

- `apps/www/src/lib/meetings/view.ts`
- `apps/www/src/lib/meetings/view.test.ts`
- Maybe `apps/www/src/lib/meetings/types.ts` if a small view-facing type is useful.

## Helpers To Implement

Recommended helpers:

- `formatMeetingDate(meeting.date)` for visible meeting date.
- `formatMeetingMetaDate(meeting.date)` if SEO/schema needs a concise machine-friendly variant.
- `describeMeeting(meeting)` for meta description.
- `formatTranscriptTime(segment.start)` for visible timestamps.
- `formatTranscriptRange(segment)` if start/end display uses a range.
- `formatTranscriptTextHtml(text)` for escaped, typografed transcript text.

Keep helpers small and domain-specific. Do not build a generic typography subsystem unless needed.

## Safe Text Formatting

`formatDynamicHtml()` from `@shelkovo/markdown` does typography but does not escape HTML. Therefore transcript text must be escaped before calling it.

Required behavior:

- `<script>` in transcript text renders as visible escaped text, not an element.
- Ampersands and quotes remain safe.
- Internal line breaks are preserved in a readable way.

Acceptable implementation options:

- Escape text, split paragraphs/lines in the Astro page, and typograf each escaped text fragment.
- Escape text and replace internal line breaks with `<br>` before `set:html`.
- Avoid `set:html` for transcript text if typography is not applied there, but this should be a deliberate exception with a comment because app guidance says dynamic text should be typografed at render time.

Preferred minimal implementation:

```ts
const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const formatTranscriptTextHtml = (text: string): string =>
  formatDynamicHtml(escapeHtml(text)).replace(/\n/gu, '<br>');
```

Adjust only if tests show typograf or HTML output needs a different shape.

## Description Rules

`describeMeeting(meeting)` should use real page data and stay around 160-170 characters.

Suggested shape:

- Start with `meeting.context`.
- Add that this is a transcript/archive source only if the context is too short.
- Do not make editorial claims about decisions or outcomes.

## Tests To Add

Add `apps/www/src/lib/meetings/view.test.ts`:

- Formats date with the existing Russian date style.
- Builds a description from meeting context.
- Formats transcript time consistently.
- Escapes `<script>` and HTML-looking text.
- Preserves line breaks.
- Does not produce raw unescaped `<a>`/`<script>` from transcript text.

## Acceptance Criteria

- [ ] Transcript text has a tested safe HTML path.
- [ ] Helpers do not import raw schemas.
- [ ] Descriptions follow `docs/page-meta.md`.
- [ ] No page UI is added in this task.

## Verification

- [ ] Run `pnpm --filter @shelkovo/www test -- src/lib/meetings/view.test.ts`.

## Memory Updates

Record the final safe transcript HTML helper name in `memory.md`.

## Subagent Boundary

Subagent may implement and run focused tests. Subagent must not commit and must not mark `context.md` todo.
