import type { StatusArea, StatusKind } from './schema';
import type { StatusDuration } from './types';
import type { StatusTimelineIncidentInput } from './timeline';

export interface StatusTimelineTooltipDurationDto {
  readonly totalMinutes: number;
}

export interface StatusTimelineTooltipItemDto {
  readonly kind: StatusKind;
  readonly title: string;
  readonly isActive: boolean;
  readonly startedIso: string;
  readonly startedHasTime: boolean;
  readonly endedIso?: string;
  readonly endedHasTime: boolean;
  readonly areas?: readonly StatusArea[];
  readonly duration?: StatusTimelineTooltipDurationDto;
}

const toDurationDto = (
  duration?: StatusDuration,
): StatusTimelineTooltipDurationDto | undefined =>
  duration ? { totalMinutes: duration.totalMinutes } : undefined;

export const toStatusTimelineTooltipItemDto = ({
  areas,
  duration,
  endedHasTime,
  endedIso,
  isActive,
  kind,
  startedHasTime,
  startedIso,
  title,
}: StatusTimelineIncidentInput): StatusTimelineTooltipItemDto => {
  const durationDto = toDurationDto(duration);

  return {
    kind,
    title,
    isActive,
    startedIso,
    startedHasTime,
    ...(endedIso ? { endedIso } : {}),
    endedHasTime,
    ...(areas?.length ? { areas } : {}),
    ...(durationDto ? { duration: durationDto } : {}),
  };
};
