# Memories

## Patterns

## Decisions

## Fixes

### mem-1779873724-f7b1

> failure: cmd=node -e generated meetings artifact invariant checks, exit=1, error=expected numeric schemaVersion but actual public DTO schemaVersion is string 1.0.0, next=assert schemaVersion equals "1.0.0" for meetings JSON feed checks

<!-- tags: tooling, meetings, testing | created: 2026-05-27 -->

### mem-1779873338-870a

> failure: cmd=node -e generated artifact invariant checks with template literals inside double-quoted zsh string, exit=1, error=zsh:1: bad substitution, next=wrap node -e program in single quotes or avoid shell-expanded template literals

<!-- tags: tooling, meetings | created: 2026-05-27 -->

### mem-1779871894-86c7

> failure: cmd=ralph emit build.done --payload '{...}', exit=2, error=unexpected argument '--payload'; ralph emit usage is ralph emit <TOPIC> [PAYLOAD], next=pass JSON payload as positional argument

<!-- tags: ralph, tooling | created: 2026-05-27 -->

### mem-1779870592-25ab

> failure: cmd=pnpm audit --audit-level high, exit=1, error=dev dependency @lhci/cli pulls vulnerable tmp via inquirer/external-editor and tmp, next=use production audit for current no-dependency-change sitemap slice or upgrade/remove @lhci/cli in a separate dependency-maintenance task

<!-- tags: audit, dependencies, meetings | created: 2026-05-27 -->

### mem-1779869220-840c

> failure: cmd=nginx -t -c /Volumes/Projects/private/ok-compare/ops/nginx/kpshelkovo-online.conf, exit=127, error=zsh:1: command not found: nginx, next=run nginx validation in deploy environment; local static route-cache tests cover kpshelkovo-online.conf expectations

<!-- tags: nginx, tooling | created: 2026-05-27 -->

### mem-1779868782-afc7

> failure: cmd=nginx -t, exit=127, error=zsh: command not found: nginx, next=nginx validation must run in deploy environment; local static route-cache tests cover kpshelkovo-online.conf expectations

<!-- tags: nginx, tooling | created: 2026-05-27 -->

### mem-1779868664-60dc

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/public-surface src/lib/root-discovery-routes.test.ts src/lib/route-cache-coverage.test.ts, exit=1, error=text/plain MIME assertion also matched pre-existing /robots.txt outside llms scope, next=limit text/plain assertion to llms routes

<!-- tags: testing, nginx, llms | created: 2026-05-27 -->

### mem-1779868631-5625

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/public-surface src/lib/root-discovery-routes.test.ts src/lib/route-cache-coverage.test.ts, exit=1, error=text/plain MIME assertion exposed root /llms-full.txt location without default_type, next=add default_type text/plain to root llms nginx location consistently

<!-- tags: testing, nginx, llms | created: 2026-05-27 -->

### mem-1779868601-4c78

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/public-surface src/lib/root-discovery-routes.test.ts src/lib/route-cache-coverage.test.ts, exit=1, error=scoped data JSON MIME assertion also matched pre-existing /815/compare/data/explorer.json location without default_type, next=limit new JSON MIME assertion to /meetings/data routes for task 008

<!-- tags: testing, nginx, meetings | created: 2026-05-27 -->

### mem-1779868574-37d4

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/public-surface src/lib/root-discovery-routes.test.ts src/lib/route-cache-coverage.test.ts, exit=1, error=new JSON MIME assertion also matched existing /.well-known/agent-skills/index.json outside meetings task scope, next=narrow JSON MIME assertion to data-feed routes for this slice

<!-- tags: testing, nginx, meetings | created: 2026-05-27 -->

### mem-1779868494-803e

> expected RED: cmd=pnpm --filter @shelkovo/www test -- src/lib/public-surface src/lib/root-discovery-routes.test.ts src/lib/route-cache-coverage.test.ts, exit=1, error=meetings public surface owner missing and /meetings/data/meetings.json matched nginx fallback without explicit Cache-Control, next=add meetings public-surface slice, register it, and add meetings data/llms nginx cache handling

<!-- tags: testing, meetings, nginx | created: 2026-05-27 -->

### mem-1779866777-28c2

> expected RED: cmd=pnpm --filter @shelkovo/www test -- src/lib/meetings/json-route.test.ts src/lib/meetings/public-dto.test.ts, exit=1, error=JSON route generatedAt used current Date and public DTO snapshot still expected routeId/canonical, next=set deterministic system time and update public DTO snapshot

<!-- tags: testing, meetings | created: 2026-05-27 -->

### mem-1779866104-fb72

> failure: cmd=pnpm --filter @shelkovo/www build, exit=1, error=Astro prerender discovered src/pages/meetings/[date]/[slug]/index.md.test.ts and crashed on Vitest vi.queueMock, next=move route test out of src/pages while importing real route module from lib test

<!-- tags: build, testing, meetings, astro | created: 2026-05-27 -->

### mem-1779866006-39e7

> failure: cmd=pnpm --filter @shelkovo/www build, exit=1, error=Astro prerender imports src/pages/meetings/[date]/[slug]/index.md.test.ts as an endpoint and crashes on vitest vi.queueMock outside Vitest, next=move route test out of src/pages or rename it so Astro page discovery ignores it

<!-- tags: build, testing, meetings, astro | created: 2026-05-27 -->

### mem-1779866006-fa9f

> failure: cmd=pnpm --filter @shelkovo/www exec node -e import yaml from @shelkovo/www, exit=1, error=ERR_MODULE_NOT_FOUND because @shelkovo/www has no direct yaml dependency, next=run YAML serialization probes from @shelkovo/markdown package or through @shelkovo/markdown API

<!-- tags: tooling, markdown, meetings | created: 2026-05-27 -->

### mem-1779865694-9c6f

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=parseMarkdownFragment returns RootContent too broad for md.listItem block input and APIRoute test context cast too narrow, next=use explicit MarkdownListItemInput for anchor blocks and cast route test context through unknown

<!-- tags: typecheck, meetings, testing | created: 2026-05-27 -->

### mem-1779865613-35df

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/meetings/markdown.test.ts 'src/pages/meetings/[date]/[slug]/index.md.test.ts', exit=1, error=meetings markdown route missing nginx markdown cache/MIME coverage and transcript anchor raw HTML escaped by md.text, next=add route cache coverage and parse raw anchor fragment

<!-- tags: testing, meetings, nginx | created: 2026-05-27 -->

### mem-1779865534-cbab

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/meetings/markdown.test.ts src/pages/meetings/[date]/[slug]/index.md.test.ts, exit=1, error=zsh no matches found for unquoted bracket route path, next=quote bracketed paths in shell commands

<!-- tags: tooling, testing, meetings | created: 2026-05-27 -->

### mem-1779865293-5c9c

> failure: cmd=grep hasMeetingProtocol|documents-only|#protocol|documents with two space-separated paths in one path arg, exit=tool error, error=No such file or directory for combined path, next=run separate grep calls per directory

<!-- tags: tooling, grep, meetings | created: 2026-05-27 -->

### mem-1779864954-530b

> expected RED: cmd=pnpm --filter @shelkovo/www test -- src/components/meetings/MeetingDetail.test.ts src/lib/meetings/view.test.ts, exit=1, error=documents-only meeting still renders protocol section because hasMeetingProtocol includes documents, next=remove documents from protocol trigger

<!-- tags: testing, meetings | created: 2026-05-27 -->

### mem-1779864649-518f

> failure: cmd=git diff -- apps/www/src/pages/meetings/[date]/[slug]/index.astro ..., exit=1, error=zsh no matches found for unquoted bracket route path, next=quote bracketed paths in git commands

<!-- tags: git, shell | created: 2026-05-27 -->

### mem-1779864516-7175

> failure: cmd=pnpm --filter @shelkovo/www test -- src/components/meetings/MeetingDetail.test.ts src/lib/meetings/view.test.ts, exit=1, error=route-cache samplePath used date=example so meetings nginx date regex did not match, next=add date example to route cache test params

<!-- tags: testing, meetings, nginx | created: 2026-05-27 -->

### mem-1779864464-7bb3

> failure: cmd=pnpm --filter @shelkovo/www test -- src/components/meetings/MeetingDetail.test.ts src/lib/meetings/view.test.ts, exit=1, error=route-cache-coverage snapshot missing new /meetings/ HTML route families, next=update route coverage expectation or route cache contract for new meetings pages

<!-- tags: testing, meetings, nginx | created: 2026-05-27 -->

### mem-1779864322-f20e

> expected RED: cmd=pnpm --filter @shelkovo/www test -- src/components/meetings/MeetingDetail.test.ts src/lib/meetings/view.test.ts, exit=1, error=missing meetings view helpers and MeetingDetail Astro component, next=implement view.ts and MeetingDetail.astro

<!-- tags: testing, meetings | created: 2026-05-27 -->

### mem-1779863784-bf81

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=mentions/site-registry passed id/data-only people entries to createPeopleMentionRegistry typed as requiring body, next=narrow registry adapter input type to id/data

<!-- tags: typecheck, mentions, people | created: 2026-05-27 -->

### mem-1779863647-00fb

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/mentions/mentions.test.ts src/lib/meetings/load.test.ts src/lib/people/backlinks.test.ts src/lib/people/public-dto.test.ts src/lib/people/discovery.test.ts src/lib/people/view.test.ts src/lib/people/llms.test.ts, exit=1, error=people public DTO snapshot expected meetings key after news but serializer emits object insertion order meetings before news, next=update snapshot order

<!-- tags: testing, people | created: 2026-05-27 -->

### mem-1779863575-f932

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/mentions/mentions.test.ts src/lib/meetings/load.test.ts src/lib/people/backlinks.test.ts src/lib/people/public-dto.test.ts, exit=1, error=duplicate meeting target masks duplicate meeting id and people fixtures missing meetings backlinks field, next=preserve duplicate id validation order and update people test fixtures/snapshots

<!-- tags: testing, meetings, people | created: 2026-05-27 -->

### mem-1779863407-4026

> expected RED: cmd=pnpm --filter @shelkovo/www test -- src/lib/mentions/mentions.test.ts src/lib/meetings/load.test.ts, exit=1, error=meeting body lacks mentions array and self-link sourceEntity check, next=store meeting mentions and pass meeting source entity

<!-- tags: testing, meetings | created: 2026-05-27 -->

### mem-1779824482-4ed6

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/meetings/load.test.ts src/lib/meetings/public-dto.test.ts, exit=1, error=duplicate-id test fixture hit slug mismatch first and DTO emitted undefined optional fields, next=adjust duplicate fixture and omit undefined optional public fields

<!-- tags: testing, meetings | created: 2026-05-26 -->

### mem-1779824371-9d2f

> expected RED: cmd=pnpm --filter @shelkovo/www test -- src/lib/meetings/load.test.ts src/lib/meetings/public-dto.test.ts, exit=1, error=missing meetings load/public-dto modules, next=implement domain loader and public DTO

<!-- tags: testing, meetings | created: 2026-05-26 -->

### mem-1779823661-d341

> expected RED: cmd=pnpm --filter @shelkovo/www test -- src/lib/meetings/raw-schema.test.ts, exit=1, error=00:99:99 transcript timecode accepted by loose HH:MM:SS regex, next=constrain minutes and seconds to 00-59

<!-- tags: testing, meetings | created: 2026-05-26 -->

### mem-1779823406-ca6f

> expected RED: cmd=pnpm --filter @shelkovo/www test -- src/lib/meetings/source.test.ts, exit=1, error=uppercase INDEX.md accepted by case-insensitive meetings source regex, next=remove regex i flag

<!-- tags: testing, meetings | created: 2026-05-26 -->

### mem-1779823305-6a4e

> failure: cmd=pnpm --filter @shelkovo/www exec tsx -e <createMeetingSourceId adversarial check>, exit=1, error=Command tsx not found, next=use existing tests/static review instead of tsx for TypeScript one-off checks

<!-- tags: testing, meetings | created: 2026-05-26 -->

### mem-1779823089-9417

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=TS18047 match possibly null despite never helper, next=throw inline inside null guard

<!-- tags: typecheck, meetings | created: 2026-05-26 -->

### mem-1779823069-477c

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=TS2488 RegExpExecArray|null destructure in meetings/source.ts, next=avoid nullable destructure after guard

<!-- tags: typecheck, meetings | created: 2026-05-26 -->

### mem-1779823004-ba9f

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/meetings, exit=1, error=date path test saw generic layout failure before date-specific validation, next=relax source regex then validate date segment separately

<!-- tags: testing, meetings | created: 2026-05-26 -->

### mem-1779822919-56d9

> expected RED: cmd=pnpm --filter @shelkovo/www test -- src/lib/meetings, exit=1, error=missing new meetings modules, next=implement source contract modules

<!-- tags: testing, meetings | created: 2026-05-26 -->

## Context
