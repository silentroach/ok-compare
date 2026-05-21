import type {
  EntityMentionGraph,
  EntityMentionGraphTarget,
  EntityMentionSourceRef,
  EntityMentionType,
} from './types';

import { compareRuText } from '@shelkovo/format';

const targetKey = (type: EntityMentionType, slug: string): string =>
  `${type}:${slug}`;

const sourceUnitKey = (ref: EntityMentionSourceRef): string =>
  `${targetKey(ref.targetType, ref.targetSlug)}:${ref.sourceSection}:${ref.sourceKind}:${ref.sourceId}`;

const compareRefs = (
  a: EntityMentionSourceRef,
  b: EntityMentionSourceRef,
): number =>
  (b.sortKey ?? Number.NEGATIVE_INFINITY) -
    (a.sortKey ?? Number.NEGATIVE_INFINITY) ||
  compareRuText(a.title, b.title) ||
  compareRuText(a.sourceId, b.sourceId);

const assertNotSelfLink = (ref: EntityMentionSourceRef): void => {
  if (
    ref.sourceEntity?.type === ref.targetType &&
    ref.sourceEntity.slug === ref.targetSlug
  ) {
    throw new Error(
      `self-link mention ref ${targetKey(ref.targetType, ref.targetSlug)}`,
    );
  }
};

const createGraphTarget = (
  type: EntityMentionType,
  slug: string,
): EntityMentionGraphTarget => ({
  type,
  slug,
  sections: new Map(),
});

export const createEntityMentionGraph = (
  refs: readonly EntityMentionSourceRef[],
): EntityMentionGraph => {
  const targets = new Map<string, EntityMentionGraphTarget>();
  const seen = new Set<string>();

  for (const ref of refs) {
    assertNotSelfLink(ref);

    const unitKey = sourceUnitKey(ref);

    if (seen.has(unitKey)) {
      continue;
    }

    seen.add(unitKey);

    const key = targetKey(ref.targetType, ref.targetSlug);
    const target =
      targets.get(key) ?? createGraphTarget(ref.targetType, ref.targetSlug);
    const sections = new Map(target.sections);
    const current = sections.get(ref.sourceSection) ?? [];

    sections.set(ref.sourceSection, [...current, ref].sort(compareRefs));
    targets.set(key, { ...target, sections });
  }

  return { targets };
};

export const getEntityMentionGraphRefs = (
  graph: EntityMentionGraph,
  type: EntityMentionType,
  slug: string,
  sourceSection: string,
): readonly EntityMentionSourceRef[] =>
  graph.targets.get(targetKey(type, slug))?.sections.get(sourceSection) ?? [];
