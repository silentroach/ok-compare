import type { StatusArea, StatusKind } from './schema';
import type { StatusTimelineIncidentInput } from './timeline';
import type { StatusDuration } from './types';

export interface StatusTimelineTooltipItemDto {
  readonly kind: StatusKind;
  readonly title: string;
  readonly isActive: boolean;
  readonly startedIso: string;
  readonly startedHasTime: boolean;
  readonly endedIso?: string;
  readonly endedHasTime: boolean;
  readonly areas?: readonly StatusArea[];
  readonly duration?: StatusDuration;
}

export const toStatusTimelineTooltipItemDto = (
  item: StatusTimelineIncidentInput,
): StatusTimelineTooltipItemDto => ({
  kind: item.kind,
  title: item.title,
  isActive: item.isActive,
  startedIso: item.startedIso,
  startedHasTime: item.startedHasTime,
  endedIso: item.endedIso,
  endedHasTime: item.endedHasTime,
  areas: item.areas?.length ? item.areas : undefined,
  duration: item.duration,
});
