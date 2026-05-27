import type { PublicSurfaceSlice } from '@/lib/public-surface/types';

import {
  meetingMarkdownPattern,
  meetingPattern,
  meetingsDataPath,
  meetingsLlmsFullPath,
  meetingsLlmsPath,
  meetingsPath,
} from './routes';

export const meetingsPublicSurfaceSlice = {
  owner: {
    id: 'meetings',
    label: 'Встречи',
    entryPath: meetingsPath(),
  },
  surfaces: [
    {
      id: 'meetings:index',
      label: 'Архив встреч',
      path: meetingsPath(),
      mediaType: 'text/html',
      cacheClass: 'html',
      discoveryRoles: ['section-entry'],
      catalogRole: 'anchor',
    },
    {
      id: 'meetings:detail',
      label: 'Страница встречи',
      routePattern: meetingPattern(),
      mediaType: 'text/html',
      cacheClass: 'html',
      discoveryRoles: ['detail-page'],
    },
    {
      id: 'meetings:detail-markdown',
      label: 'Markdown-версия встречи',
      routePattern: meetingMarkdownPattern(),
      mediaType: 'text/markdown',
      cacheClass: 'markdown',
      discoveryRoles: ['markdown-companion'],
    },
    {
      id: 'meetings:data',
      label: 'Машиночитаемая лента встреч',
      path: meetingsDataPath(),
      mediaType: 'application/json',
      cacheClass: 'data',
      discoveryRoles: ['data-feed', 'root-catalog'],
      catalogRole: 'item',
    },
    {
      id: 'meetings:llms',
      label: 'Агентный обзор встреч',
      path: meetingsLlmsPath(),
      mediaType: 'text/plain',
      cacheClass: 'static',
      discoveryRoles: ['llms', 'root-catalog'],
      catalogRole: 'item',
    },
    {
      id: 'meetings:llms-full',
      label: 'Подробный обзор встреч',
      path: meetingsLlmsFullPath(),
      mediaType: 'text/plain',
      cacheClass: 'static',
      discoveryRoles: ['llms'],
      catalogRole: 'item',
    },
  ],
} satisfies PublicSurfaceSlice;
