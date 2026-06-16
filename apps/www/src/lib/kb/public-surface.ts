import type { PublicSurfaceSlice } from '@/lib/public-surface/types';

import { kbDetailPattern, kbPath } from './routes';

export const kbPublicSurfaceSlice = {
  owner: {
    id: 'kb',
    label: 'База знаний',
    entryPath: kbPath(),
  },
  surfaces: [
    {
      id: 'kb:index',
      label: 'База знаний',
      path: kbPath(),
      mediaType: 'text/html',
      cacheClass: 'html',
      discoveryRoles: ['section-entry'],
      catalogRole: 'anchor',
    },
    {
      id: 'kb:page',
      label: 'Страница базы знаний',
      routePattern: kbDetailPattern(),
      mediaType: 'text/html',
      cacheClass: 'html',
      discoveryRoles: ['detail-page'],
    },
  ],
} satisfies PublicSurfaceSlice;
