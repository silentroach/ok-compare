# Memories

## Patterns

## Decisions

## Fixes

### mem-1779304427-49fe

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/people/load.test.ts -t "keeps news and status loaders off", exit=1, error=RED structural test found news/status statically imported ../people/load, next=extract people registry/dataset loader into people/registry.ts and update news/status imports

<!-- tags: testing, mentions, error-handling | created: 2026-05-20 -->

### mem-1779303680-7ceb

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/locale.test.ts, exit=1, error=RED expected missing ./locale helper before implementation, next=add compareRuText helper and update callers

<!-- tags: testing, locale, error-handling | created: 2026-05-20 -->

### mem-1779303052-1ae7

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=src/lib/news/load.test.ts mock registry typed as readonly SiteMentionRegistry so .set was unavailable, next=type the intentional mutation test double as mutable Map

<!-- tags: typecheck, testing, mentions, error-handling | created: 2026-05-20 -->

### mem-1779303003-db08

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts -t "does not let fallback registry mutations make later mentions valid", exit=1, error=test expected unknown entity mention "leaked" but actual includes "@leaked", next=assert the existing entity-level error text with @slug

<!-- tags: testing, mentions, error-handling | created: 2026-05-20 -->

### mem-1779302507-229c

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/news/load.test.ts src/lib/status/load.test.ts, exit=1, error=RED fallback EMPTY_MENTION_REGISTRY leaked mutation between dataset builds, next=allocate fresh fallback SiteMentionRegistry per build when mention_registry is omitted

<!-- tags: testing, mentions, error-handling | created: 2026-05-20 -->

### mem-1779301780-2b46

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/markdown src/lib/news/load.test.ts src/lib/status/load.test.ts src/lib/people/load.test.ts, exit=1, error=test expected old self-link wording, actual generic entity message, next=assert generic source context error text

<!-- tags: testing, mentions, error-handling | created: 2026-05-20 -->

### mem-1779301765-e342

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/markdown, exit=1, error=RED expected missing preprocessSiteMarkdownContent export, next=implement shared markdown content helper and update loaders

<!-- tags: testing, mentions, error-handling | created: 2026-05-20 -->

### mem-1779300717-2b15

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/mentions, exit=1, error=RED encoded labelled mention destination was silently ignored, next=fail clearly for encoded @...%... destinations and harden raw URL boundary detection

<!-- tags: mentions, testing, error-handling | created: 2026-05-20 -->

### mem-1779300717-1484

> failure: cmd=node --input-type=module import remark-parse from workspace root, exit=1, error=ERR_MODULE_NOT_FOUND for app dependency, next=run investigation through pnpm --filter @shelkovo/www exec node

<!-- tags: mentions, testing, error-handling | created: 2026-05-20 -->

### mem-1779293175-ead4

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=EntityMentionGraphTarget.sections typed ReadonlyMap while graph builder mutates it; PersonBacklinks import unused, next=update graph builder to replace section maps immutably and remove unused import

<!-- tags: typecheck, mentions, error-handling | created: 2026-05-20 -->

### mem-1779293140-54d9

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/mentions/graph.test.ts src/lib/people/load.test.ts src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mention-refs.test.ts, exit=1, error=graph sort test expected duplicate source_id to survive although graph correctly dedupes same source unit, next=fix test data to use distinct source ids for source_id tie-break

<!-- tags: testing, mentions, error-handling | created: 2026-05-20 -->

### mem-1779293027-a4d9

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/mentions/graph.test.ts src/lib/people/load.test.ts src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mention-refs.test.ts, exit=1, error=RED expected missing ./mentions/graph and buildPeopleGraphDataset still reads related.news.articles, next=implement generic EntityMentionGraph and migrate people graph signature to source refs

<!-- tags: testing, mentions, error-handling | created: 2026-05-20 -->

### mem-1779292458-4037

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/news/mentions.test.ts src/lib/status/mentions.test.ts src/lib/people/mention-refs.test.ts src/lib/mentions, exit=1, error=RED expected missing source ref adapter modules ./news/mentions ./status/mentions ./people/mention-refs, next=implement EntityMentionSourceRef and adapters

<!-- tags: testing, mentions, error-handling | created: 2026-05-20 -->

### mem-1779291943-9192

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=people discovery expected PersonMentionTarget fields after PersonProfile.mentions became EntityMentionTarget[]; next=serialize discovery mentions from generic label/url fields and preserve optional person context with guarded properties

<!-- tags: typecheck, mentions, error-handling | created: 2026-05-20 -->

### mem-1779291943-72c2

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/markdown src/lib/mentions src/lib/people/load.test.ts src/lib/news/load.test.ts src/lib/status/load.test.ts, exit=1, error=RED step failed because render pipeline still ignored generic mentions option and loaders still read people_registry; next=wire RenderSiteMarkdownOptions.mentions and rename loader option to mention_registry

<!-- tags: testing, mentions, error-handling | created: 2026-05-20 -->

### mem-1779291285-7d66

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=src/lib/people/discovery.test.ts manual PersonMentionTarget lacks new type/label fields, next=update fixture to use createPersonMentionTarget or include neutral fields

<!-- tags: typecheck, mentions, error-handling | created: 2026-05-20 -->

### mem-1779291255-3a2a

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/mentions src/lib/people/mentions.test.ts src/lib/markdown/render.test.ts, exit=1, error=news/load.test expected old people-specific 'has no gen name case' message but generic normalizer now reports missing label case, next=update affected test expectation to entity-level wording

<!-- tags: testing, mentions, error-handling | created: 2026-05-20 -->

### mem-1779291109-ee74

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/mentions, exit=1, error=Cannot find module './index' imported from apps/www/src/lib/mentions/mentions.test.ts, next=implement apps/www/src/lib/mentions generic registry/normalizer

<!-- tags: testing, mentions, error-handling | created: 2026-05-20 -->

## Context
