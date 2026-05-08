# Task 009: Agent Evaluation

Status: [ ] Pending

## Description

Create a small evaluation checklist that proves the new layer helps LLM agents answer better than the old markdown/JSON dump.

## Acceptance Criteria

- [ ] Evaluation includes 5 concrete questions agents should answer from the new layer.
- [ ] Questions cover composition, cost breakdown, source audit, derived values and `needs_check`.
- [ ] Expected answer criteria are written in docs or snapshots.
- [ ] At least one question compares old detail surfaces versus new row dossier output.

## Verification

- [ ] Evaluation doc exists under this task package or `docs/`.
- [ ] Manual run records whether each question is answerable from `/details/agent.md` and new JSON.
- [ ] Any failures become follow-up tasks or edits before marking the checkpoint complete.

## Dependencies

- Task 007.
- Task 008.

## Files Likely Touched

- `docs/tasks/llm-friendly-estimate-details/evaluation.md`
- `apps/www/src/lib/reglament/detail-agent-markdown.test.ts`

## Estimated Scope

Small: 1-2 files.
