import type {
  EntityMentionSourceRef,
  EntityMentionSourceRefSource,
  EntityMentionTarget,
} from './types';

export const createEntityMentionSourceRefs = (
  mentions: readonly EntityMentionTarget[],
  source: EntityMentionSourceRefSource,
): readonly EntityMentionSourceRef[] => {
  const seen = new Set<string>();
  const refs: EntityMentionSourceRef[] = [];

  for (const mention of mentions) {
    const key = `${mention.type}:${mention.slug}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    refs.push({
      target_type: mention.type,
      target_slug: mention.slug,
      ...source,
    });
  }

  return refs;
};
