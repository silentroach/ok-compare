# Memories

## Patterns

## Decisions

## Fixes

### mem-1778864758-a040

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/markdown/llms-document.test.ts src/lib/reglament/detail-markdown.test.ts src/lib/llms.test.ts src/lib/reglament/llms.test.ts src/compare/lib/llms.test.ts src/lib/news/llms.test.ts src/lib/status/llms.test.ts src/lib/people/llms.test.ts, exit=1, error=llms-document helper parsed bullet lines independently and flattened nested detail Markdown bullets, next=parse section body blocks instead of individual list items

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778864603-9a36

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/markdown/llms-document.test.ts, exit=1, error=RED llms helper test cannot import ./llms-document because helper is not implemented yet, next=add shared helper and migrate llms generators to it

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778864513-980f

> failure: cmd=ls "." && mkdir "logs", exit=1, error=mkdir reported logs already exists after parent listing showed logs, next=skip logs creation when directory already exists

<!-- tags: tooling, error-handling | created: 2026-05-15 -->

### mem-1778863938-e285

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/llms.test.ts src/lib/reglament/llms.test.ts src/compare/lib/llms.test.ts, exit=1, error=post-migration snapshots needed serializer escaping for brackets/underscore and adjusted reglament excerpt line count, next=update inline snapshots to package serializer output

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778863886-c065

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/llms.test.ts src/lib/reglament/llms.test.ts src/compare/lib/llms.test.ts, exit=1, error=RED snapshots show root/reglament/compare llms old string generators emit plain headings and bare URLs, next=migrate these llms generators to @shelkovo/markdown AST serialization

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778863798-31e2

> failure: cmd=ls "." && mkdir "logs", exit=1, error=mkdir reported logs already exists after parent listing showed logs, next=skip logs creation when directory already exists

<!-- tags: tooling, error-handling | created: 2026-05-15 -->

### mem-1778862693-72f7

> failure: cmd=pnpm --filter @shelkovo/www test -- src/compare/lib/markdown.test.ts, exit=1, error=post-migration compare snapshots expected explicit bracket links/old exact distance while package serializer emits autolinks and existing distance formatter rounds values, next=update compare snapshots to serializer-owned output

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778862689-4d64

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=settlement detail list inferred ListItem|undefined because optional row helper participates in array literal, next=filter optional list entries with typed pick helper before md.list

<!-- tags: typescript, markdown, error-handling | created: 2026-05-15 -->

### mem-1778862625-4d43

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=compare markdown migration shadowed md helper with markdown URL and passed Link where MarkdownPhrasingInput array is required; test fixture readonly sources not assignable, next=rename local URL and wrap links/type fixture

<!-- tags: typescript, markdown, error-handling | created: 2026-05-15 -->

### mem-1778862492-29a2

> failure: cmd=pnpm --filter @shelkovo/www test -- src/compare/lib/markdown.test.ts, exit=1, error=RED compare markdown snapshots show old string generator emits bare URLs/list spacing instead of AST serializer-owned links, next=migrate compare markdown.ts to @shelkovo/markdown AST API

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778861886-1c3a

> failure: cmd=git commit -m 'migrate reglament detail markdown ast', exit=128, error=1Password signing failed with 'failed to fill whole buffer' after pre-commit hooks completed on finalization.failed retry; task 06 remains staged/uncommitted, next=retry signed commit once local 1Password signing agent is available or user explicitly approves an unsigned commit

<!-- tags: git, tooling, error-handling | created: 2026-05-15 -->

### mem-1778861742-4176

> failure: cmd=git commit -m 'migrate reglament detail markdown ast', exit=128, error=1Password signing failed with 'failed to fill whole buffer' after pre-commit hooks completed on finalization.failed retry, next=retry signed commit once local 1Password signing agent is available or user explicitly approves an unsigned commit

<!-- tags: git, tooling, error-handling | created: 2026-05-15 -->

### mem-1778861601-4ec2

> failure: cmd=git commit -m 'migrate reglament detail markdown ast', exit=128, error=1Password signing failed with 'failed to fill whole buffer' after pre-commit hooks completed on retry, next=retry signed commit once local 1Password signing agent is available or user explicitly approves an unsigned commit

<!-- tags: git, tooling, error-handling | created: 2026-05-15 -->

### mem-1778861443-1b6e

> failure: cmd=git commit -m 'migrate reglament detail markdown ast', exit=128, error=1Password signing failed with 'failed to fill whole buffer' after pre-commit hooks completed, next=retry signed commit once local 1Password signing agent is available or user explicitly approves an unsigned commit

<!-- tags: git, tooling, error-handling | created: 2026-05-15 -->

### mem-1778861297-e8fd

> failure: cmd=git commit -m 'migrate reglament detail markdown ast', exit=128, error=1Password signing failed with 'failed to fill whole buffer' after hooks completed on retry, next=commit once local signing agent is available or user explicitly allows an unsigned commit

<!-- tags: git, tooling, error-handling | created: 2026-05-15 -->

### mem-1778861123-335b

> failure: cmd=git commit -m 'migrate reglament detail markdown ast', exit=128, error=1Password signing failed with 'failed to fill whole buffer' after hooks completed, next=commit once local signing agent is available or user explicitly allows an unsigned commit

<!-- tags: git, tooling, error-handling | created: 2026-05-15 -->

### mem-1778860875-21b4

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/reglament/detail-markdown.test.ts, exit=1, error=post-migration detail overview snapshot still expected pre-AST bare URLs/underscore ids/compact blank lines, next=update detail snapshots/assertions to package serializer-owned output

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778860840-9123

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/reglament/detail-markdown.test.ts, exit=1, error=RED test confirmed old reglament detail generator emits bare URLs instead of mdast-owned autolinks/topic links, next=migrate detail-markdown.ts to @shelkovo/markdown AST API

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778860466-4e1b

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/reglament/markdown.test.ts, exit=1, error=post-migration test expected source ref without fragment and raw underscore id while serializer output included fragment and escaped underscore, next=update tests to package serializer-owned output with String.raw for escaped ids

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778860466-09ab

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/reglament/markdown.test.ts, exit=1, error=expected RED showed old reglament string generators emitted bare URLs/source refs instead of mdast-owned links/autolinks, next=migrate reglament overview/full generators to @shelkovo/markdown AST API

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778859541-648f

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/people, exit=1, error=people contact expectation used invalid TS escape for literal backslash before underscore, next=use String.raw or doubled escaping for serializer-owned escaped underscore

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778859512-044b

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/people/view.test.ts -t "parses profile body as Markdown fragment without nested frontmatter", exit=1, error=people detail test still expected pre-AST underscore escaping and compact blank-line layout, next=update people tests to package serializer-owned output

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778859440-b020

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/people/view.test.ts -t "parses profile body as Markdown fragment without nested frontmatter", exit=1, error=new RED test shows profile.body YAML frontmatter is included by old string generator, next=migrate people markdown generator to @shelkovo/markdown parseMarkdownFragment

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778859285-832c

> failure: cmd=pnpm --filter @shelkovo/www exec vitest run src/lib/status/markdown.test.ts -t "does not serialize incident body frontmatter", exit=0, error=Vitest skipped because no test matched filter, next=inspect test names and rerun existing adversarial status Markdown test

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778858909-4354

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=status markdown local phrasing array typed readonly and push was rejected, next=derive element type and use mutable local array only inside builder

<!-- tags: typescript, markdown, error-handling | created: 2026-05-15 -->

### mem-1778858875-2740

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/status/markdown.test.ts, exit=1, error=status incident snapshot still expected pre-AST YAML quoting and final blank line, next=update snapshot to package serializer-owned output

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778858792-c562

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/status/markdown.test.ts, exit=1, error=new RED test shows incident.body YAML frontmatter is included by old string generator, next=migrate status markdown generator to @shelkovo/markdown parseMarkdownFragment

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778858312-e544

> failure: cmd=pnpm --filter @shelkovo/www typecheck, exit=2, error=apps/www cannot resolve direct mdast type import, next=derive news generator node types from @shelkovo/markdown exported functions instead of importing mdast

<!-- tags: typescript, markdown, error-handling | created: 2026-05-15 -->

### mem-1778858275-99b0

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/news/markdown.test.ts, exit=1, error=inline snapshot kept one extra blank line after AST serializer output, next=trim snapshot to actual single final newline

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778858244-c853

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/news/markdown.test.ts, exit=1, error=old news markdown tests expected pre-AST YAML quoting and list spacing, next=update tests to package serializer-owned output

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778858112-a02b

> failure: cmd=pnpm --filter @shelkovo/www test -- src/lib/news/markdown.test.ts, exit=1, error=new RED test shows news body/addendum YAML frontmatter fragments are included by old string generator, next=migrate news markdown generator to @shelkovo/markdown parseMarkdownFragment

<!-- tags: testing, markdown, error-handling | created: 2026-05-15 -->

### mem-1778857560-8841

> failure: cmd=pnpm --filter @shelkovo/markdown typecheck, exit=2, error=readonly extension arrays not assignable to mdast-util mutable Options arrays and unused ListContent import, next=remove unused import and use mutable extension arrays

<!-- tags: typescript, markdown, error-handling | created: 2026-05-15 -->

### mem-1778857399-b214

> failure: cmd=pnpm --filter @shelkovo/markdown add mdast-util-to-markdown mdast-util-from-markdown mdast-util-gfm mdast-util-frontmatter micromark-extension-gfm micromark-extension-frontmatter yaml @types/mdast, exit=1, error=ERR_PNPM_NO_MATURE_MATCHING_VERSION for @turbo/linux-64 due workspace minimumReleaseAge, next=rerun add with minimum-release-age disabled for this install

<!-- tags: tooling, pnpm, dependencies, error-handling | created: 2026-05-15 -->

## Context
