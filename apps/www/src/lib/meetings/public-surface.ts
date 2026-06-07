import type { PublicSurfaceSlice } from '@/lib/public-surface/types';

import { meetingPattern } from './routes';

export const meetingsPublicSurfaceSlice = {
  owner: {
    id: 'meetings',
    label: 'Архив встреч',
  },
  surfaces: [
    {
      id: 'meetings:detail',
      label: 'Страница транскрипции встречи',
      routePattern: meetingPattern(),
      mediaType: 'text/html',
      cacheClass: 'html',
      discoveryRoles: ['detail-page'],
    },
  ],
} satisfies PublicSurfaceSlice;
