import type {
  EntityMentionGraph,
  EntityMentionGraphTarget,
  EntityMentionSourceRef,
  EntityMentionType,
} from './types';

import { compareRuText } from '@/lib/locale';

const targetKey = (type: EntityMentionType, slug: string): string =>
  `${type}:${slug}`;

const sourceUnitKey = (ref: EntityMentionSourceRef): string =>
  `${targetKey(ref.target_type, ref.target_slug)}:${ref.source_section}:${ref.source_kind}:${ref.source_id}`;

const compareRefs = (
  a: EntityMentionSourceRef,
  b: EntityMentionSourceRef,
): number =>
  (b.sort_key ?? Number.NEGATIVE_INFINITY) -
    (a.sort_key ?? Number.NEGATIVE_INFINITY) ||
  compareRuText(a.title, b.title) ||
  compareRuText(a.source_id, b.source_id);

const assertNotSelfLink = (ref: EntityMentionSourceRef): void => {
  if (
    ref.source_entity?.type === ref.target_type &&
    ref.source_entity.slug === ref.target_slug
  ) {
    throw new Error(
      `self-link mention ref ${targetKey(ref.target_type, ref.target_slug)}`,
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

    const key = targetKey(ref.target_type, ref.target_slug);
    const target =
      targets.get(key) ?? createGraphTarget(ref.target_type, ref.target_slug);
    const sections = new Map(target.sections);
    const current = sections.get(ref.source_section) ?? [];

    sections.set(ref.source_section, [...current, ref].sort(compareRefs));
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
