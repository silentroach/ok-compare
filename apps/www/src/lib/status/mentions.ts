import { createEntityMentionSourceRefs } from '../mentions';
import type { EntityMentionSourceRef } from '../mentions';
import { statusIncidentMarkdownUrl } from './routes';
import type { StatusIncident } from './schema';

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
  | 'started_iso'
  | 'sort_last_change_at'
>;

export const createStatusIncidentMentionRefs = (
  incident: StatusIncidentMentionRefSource,
): readonly EntityMentionSourceRef[] =>
  createEntityMentionSourceRefs(incident.mentions, {
    source_section: 'status',
    source_kind: 'incident',
    source_id: incident.id,
    title: incident.title,
    html_url: incident.url,
    markdown_url: statusIncidentMarkdownUrl(incident),
    ...(incident.excerpt ? { excerpt: incident.excerpt } : {}),
    mentioned_at: incident.started_iso,
    sort_key: incident.sort_last_change_at,
  });
