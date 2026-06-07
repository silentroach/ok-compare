# Task 007 - Sitemap and page metadata contract

## Goal

Make canonical meeting detail pages participate in sitemap metadata and confirm page metadata follows site rules.

ADR-014 allows individual meeting pages in sitemap because they are public sources intended for external links. This task adds that contract without adding `/meetings/` index or agent-facing feeds.

## Dependencies

- Task 002 should be complete for route helpers.
- Task 003 should be complete for the source data shape.
- Task 006 can be in progress; sitemap metadata can be implemented once route helpers and data shape exist.

## Files Likely Touched

- `apps/www/src/lib/sitemap.ts`
- `apps/www/src/lib/sitemap-data.ts`
- `apps/www/src/lib/sitemap.test.ts`
- Maybe `apps/www/src/pages/meetings/[slug]/index.astro` if metadata was not finished in Task 006.
- Maybe `apps/www/src/lib/meetings/seo.ts` if schema helpers were extracted.

## Sitemap Data Contract

Extend sitemap metadata source data with meetings.

Recommended type:

```ts
export interface SitemapMeetingInput {
  readonly url: string;
  readonly dateIso: string;
  readonly updatedIso?: string;
}
```

Add `meetings` to `SitemapMetadataSourceData`.

Add `addMeetingsMetadata(index, meetings)`:

- Individual meeting URL gets `lastmod` from `updatedIso ?? dateIso`.
- Individual meeting URL gets `changefreq: yearly` because transcript pages should be stable after publication.
- Do not set metadata for `/meetings/` because it does not exist.
- Do not update root `/` metadata from meetings unless a product decision later makes meetings discoverable from root.

## Sitemap Data Loader

Follow existing `sitemap-data.ts` style.

Add `meetingsDir` pointing to `../data/meetings/`.

Read only files ending with `/index.yaml`.

Use scalar field parsing for:

- `date`
- `updated_at`

Derive URL as `/meetings/[slug]/` where slug is the directory name containing `index.yaml`.

Use the same timestamp parser behavior as news/status sitemap data. If a meeting date is invalid, fail with a clear error containing the meeting slug.

Do not parse `transcript.yaml` in sitemap loader.

## Page Metadata Check

Ensure the meeting page uses:

- `title` built from meeting title, section label `Архив встреч` and brand `Шелково Онлайн`.
- `description` from `describeMeeting(meeting)`.
- `canonical={meeting.canonical}`.
- `type="article"`.
- `techArticleSchema` or equivalent article schema with `datePublished` and optional `dateModified`.

Follow `docs/page-meta.md`:

- Do not put route names in meta.
- Do not stuff keywords.
- Keep the description concise.

## Tests To Add Or Update

Update `apps/www/src/lib/sitemap.test.ts`:

- `buildSitemapMetadataIndex` includes `/meetings/example/` when meetings data is supplied.
- Meeting `lastmod` uses `updatedIso` when present.
- Meeting `lastmod` falls back to `dateIso` when no update exists.
- No `/meetings/` index key is added.
- Existing news/status/compare sitemap behavior remains unchanged.

If page metadata was not tested elsewhere, add a small helper-level test rather than a brittle full HTML snapshot.

## Acceptance Criteria

- [ ] Sitemap metadata source data includes meetings.
- [ ] Meeting detail pages get stable sitemap metadata.
- [ ] `/meetings/` is not added to sitemap metadata.
- [ ] No Markdown, JSON, llms, schema or OpenAPI surface is added for meetings.
- [ ] Page metadata follows `docs/page-meta.md`.

## Verification

- [ ] Run `pnpm --filter @shelkovo/www test -- src/lib/sitemap.test.ts`.
- [ ] Run `pnpm --filter @shelkovo/www typecheck` if exported sitemap types changed.

## Memory Updates

Record final meeting sitemap `changefreq` and metadata fields in `memory.md`.

## Subagent Boundary

Subagent may implement and run focused tests. Subagent must not commit and must not mark `context.md` todo.
