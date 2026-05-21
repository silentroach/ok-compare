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
  | 'started'
  | 'sortLastChangeAt'
>;

export const createStatusIncidentMentionRefs = (
  incident: StatusIncidentMentionRefSource,
): readonly EntityMentionSourceRef[] =>
  createEntityMentionSourceRefs(incident.mentions, {
    source: {
      section: 'status',
      kind: 'incident',
      id: incident.id,
    },
    title: incident.title,
    htmlUrl: incident.url,
    markdownUrl: statusIncidentMarkdownUrl(incident),
    excerpt: incident.excerpt,
    mentionedAt: incident.started.iso,
    sortKey: incident.sortLastChangeAt,
  });
