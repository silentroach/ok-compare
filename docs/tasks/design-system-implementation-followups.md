# Implementation Plan: Design System Site Follow-Ups

## Overview

Follow-up tasks for applying `docs/design/design-code-shelkovo.md` to the live site and shared UI styles. This plan intentionally does not change site code during the product/design documentation pass.

## Architecture Decisions

- Runtime tokens stay in `packages/ui/styles.css`; the design guide explains intent and constraints.
- Typography should use real available font weights. PT Sans Caption headings should avoid synthesized `600` unless the font package proves that weight is available and imported.
- Table changes should preserve comparison usability on mobile. Horizontal scroll is acceptable when it keeps columns comparable.

## Task List

### Task 1: Align Heading Font Weights

**Description:** Audit headings and heading-like components that use PT Sans Caption with `font-weight: 600` / `font-semibold`, then align them with the design guide's real heading weight strategy.

**Acceptance criteria:**

- [ ] `packages/ui/styles.css` does not cause PT Sans Caption headings to render with synthesized `600`.
- [ ] Page and component headings that use `var(--font-heading)` use the intended heading weight, or explicitly use body font when semibold text is needed.
- [ ] The result preserves hierarchy on home, news, status and compare pages.

**Verification:**

- [ ] Search confirms no unintended `font-weight: 600` remains on PT Sans Caption headings.
- [ ] `pnpm typecheck` passes.
- [ ] Manual visual check at 320px, 768px, 1024px and 1440px.

**Dependencies:** None

**Files likely touched:**

- `packages/ui/styles.css`
- `apps/www/src/**/*.astro`
- `apps/www/src/**/*.svelte`

**Estimated scope:** Medium

### Task 2: Reduce Uppercase Cyrillic Tracking

**Description:** Apply the design guide's Cyrillic tracking rule to shared labels, chips, table headers and compare KPI labels.

**Acceptance criteria:**

- [ ] Shared `.ui-chip` and prose table headers use `0.06em` to `0.08em` tracking, not `0.16em` to `0.18em`.
- [ ] Page-level `tracking-[0.14em]`, `tracking-[0.16em]` and `tracking-[0.18em]` usages are reduced where they render uppercase Cyrillic labels.
- [ ] Small labels remain visually distinct without becoming harder to read.

**Verification:**

- [ ] Search for `tracking-[0.14em]`, `tracking-[0.16em]`, `tracking-[0.18em]`, `letter-spacing: 0.16em` and `letter-spacing: 0.18em` has only intentional exceptions.
- [ ] `pnpm typecheck` passes.
- [ ] Manual visual check of status, compare rating, settlement detail and regulation pages.

**Dependencies:** Task 1 preferred, but not required.

**Files likely touched:**

- `packages/ui/styles.css`
- `apps/www/src/pages/815/**/*.astro`
- `apps/www/src/compare/**/*.svelte`
- `apps/www/src/components/**/*.astro`

**Estimated scope:** Medium

### Task 3: Apply Table Mobile Rules

**Description:** Bring long comparison, regulation and markdown-rendered tables closer to the design guide's mobile table rules.

**Acceptance criteria:**

- [ ] Comparative tables keep column comparison usable on mobile, using horizontal scroll and edge affordance when needed.
- [ ] Row-oriented tables may use stacked rows only when column comparison is not the primary task.
- [ ] Important table context, source, method and updated date stay adjacent to the table or inside a nearby disclosure.

**Verification:**

- [ ] Manual check at 320px and 390px widths for compare, regulation and markdown/prose tables.
- [ ] Keyboard focus remains usable inside scroll containers and disclosures.
- [ ] `pnpm typecheck` passes.

**Dependencies:** None

**Files likely touched:**

- `packages/ui/styles.css`
- `apps/www/src/pages/815/**/*.astro`
- `apps/www/src/compare/**/*.svelte`
- `apps/www/src/components/**/*.astro`

**Estimated scope:** Medium

### Task 4: Audit Accent, Warning And Contrast Usage

**Description:** Compare current UI color usage against the contrast matrix in the design guide, especially `accent`, `warning`, status badges and small labels.

**Acceptance criteria:**

- [ ] `accent` and `accent-hover` are not used as normal text on white/surface backgrounds.
- [ ] Warning states use dark readable text on a soft background, not raw `warning` as small text on white.
- [ ] Status colors are paired with text, icon, shape or position, never color alone.

**Verification:**

- [ ] Search/audit all `text-accent`, `text-warning`, `text-success`, `text-danger`, raw `var(--color-accent)` and raw `var(--color-warning)` usages.
- [ ] Manual check of common status and alert states.
- [ ] `pnpm typecheck` passes.

**Dependencies:** None

**Files likely touched:**

- `packages/ui/styles.css`
- `apps/www/src/**/*.astro`
- `apps/www/src/**/*.svelte`

**Estimated scope:** Medium

### Task 5: Prepare Dark Theme Readiness Audit

**Description:** Do not add a theme switcher yet. Audit whether new and existing components survive `.dark` enough for future support.

**Acceptance criteria:**

- [ ] Components do not hard-code light-only backgrounds where semantic tokens should be used.
- [ ] Tables, status badges, links, focus states and overlays have an identified dark-theme behavior.
- [ ] Gaps are documented if they are too broad for the first dark-theme implementation.

**Verification:**

- [ ] Temporary `.dark` manual check in browser or static preview, without committing a public toggle.
- [ ] Screenshots or notes for major failures are attached to the follow-up issue/PR.
- [ ] `pnpm typecheck` passes if code changes are made.

**Dependencies:** Tasks 1-4 preferred.

**Files likely touched:**

- `packages/ui/styles.css`
- `apps/www/src/**/*.astro`
- `apps/www/src/**/*.svelte`

**Estimated scope:** Medium

## Checkpoint

- [ ] All touched pages build and typecheck.
- [ ] Mobile visual pass completed for the affected sections.
- [ ] Contrast issues found during implementation are either fixed or captured as explicit follow-ups.

## Open Questions

- Should PT Sans Caption remain heading-only everywhere, or should some compact card titles use Fira Sans semibold for calmer density?
- Should table scroll containers get a shared utility in `packages/ui/styles.css`, or stay local until the third repeated use?
