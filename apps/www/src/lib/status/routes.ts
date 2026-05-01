import { padNumber } from '@shelkovo/format';

import type { StatusService } from './schema';
import { canon, withBase } from '../site';

const STATUS_ROOT = '/status/';
const STATUS_MARKDOWN = '/status/index.md';
const STATUS_INCIDENTS_ROOT = '/status/incidents/';

export interface StatusIncidentRouteInput {
  readonly year: number | string;
  readonly month: number | string;
  readonly slug: string;
}

const need = (value: string, name: string): string => {
  const text = value.trim();

  if (!text) {
    throw new Error(`${name} is required`);
  }

  return text;
};

export const statusPath = (): string => STATUS_ROOT;

export const statusServicePath = (service: StatusService): string =>
  `${STATUS_ROOT}${service}/`;

export const statusIncidentPath = (input: StatusIncidentRouteInput): string =>
  `${STATUS_INCIDENTS_ROOT}${padNumber(input.year, 4)}/${padNumber(input.month, 2)}/${need(input.slug, 'slug')}/`;

export const statusUrl = (): string => withBase(STATUS_ROOT);

export const statusMarkdownUrl = (): string => withBase(STATUS_MARKDOWN);

export const statusServiceUrl = (service: StatusService): string =>
  withBase(statusServicePath(service));

export const statusServiceMarkdownUrl = (service: StatusService): string =>
  withBase(`${statusServicePath(service)}index.md`);

export const statusCanonical = (): string => canon(STATUS_ROOT);

export const statusServiceCanonical = (service: StatusService): string =>
  canon(statusServicePath(service));

export const statusIncidentUrl = (input: StatusIncidentRouteInput): string =>
  withBase(statusIncidentPath(input));

export const statusIncidentMarkdownUrl = (
  input: StatusIncidentRouteInput,
): string => withBase(`${statusIncidentPath(input)}index.md`);

export const statusIncidentCanonical = (
  input: StatusIncidentRouteInput,
): string => canon(statusIncidentPath(input));
