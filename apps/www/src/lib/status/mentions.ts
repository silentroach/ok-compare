import { createEntityMentionSourceRefs } from '../mentions';
import type { EntityMentionSourceRef } from '../mentions';
import { statusIncidentMarkdownUrl } from './routes';
import type { StatusIncident } from './types';

type StatusIncidentMentionRefSource = Pick<
  StatusIncident,
  | 'id'
  | 'title'
  | 'url'
  | 'year'
  | 'month'
  | 'slug'
  | 'excerpt'
  | 'mentions'
  | 'startedIso'
  | 'sortLastChangeAt'
>;

export const createStatusIncidentMentionRefs = (
  incident: StatusIncidentMentionRefSource,
): readonly EntityMentionSourceRef[] =>
  createEntityMentionSourceRefs(incident.mentions, {
    sourceSection: 'status',
    sourceKind: 'incident',
    sourceId: incident.id,
    title: incident.title,
    htmlUrl: incident.url,
    markdownUrl: statusIncidentMarkdownUrl(incident),
    ...(incident.excerpt ? { excerpt: incident.excerpt } : {}),
    mentionedAt: incident.startedIso,
    sortKey: incident.sortLastChangeAt,
  });
