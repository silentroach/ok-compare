import type { PublicSurfaceSlice } from '@/lib/public-surface/types';

import {
  contactMarkdownPattern,
  contactPattern,
  contactsMarkdownPath,
  contactsPath,
} from './routes';

export const contactsPublicSurfaceSlice = {
  owner: {
    id: 'contacts',
    label: 'Полезные контакты',
    entryPath: contactsPath(),
  },
  surfaces: [
    {
      id: 'contacts:index',
      label: 'Полезные контакты',
      path: contactsPath(),
      mediaType: 'text/html',
      cacheClass: 'html',
      discoveryRoles: ['section-entry'],
      catalogRole: 'anchor',
    },
    {
      id: 'contacts:index-markdown',
      label: 'Markdown-версия полезных контактов',
      path: contactsMarkdownPath(),
      mediaType: 'text/markdown',
      cacheClass: 'markdown',
      discoveryRoles: ['markdown-companion'],
      catalogRole: 'item',
    },
    {
      id: 'contacts:contact',
      label: 'Страница полезного контакта',
      routePattern: contactPattern(),
      mediaType: 'text/html',
      cacheClass: 'html',
      discoveryRoles: ['detail-page'],
    },
    {
      id: 'contacts:contact-markdown',
      label: 'Markdown-версия полезного контакта',
      routePattern: contactMarkdownPattern(),
      mediaType: 'text/markdown',
      cacheClass: 'markdown',
      discoveryRoles: ['markdown-companion'],
    },
  ],
} satisfies PublicSurfaceSlice;
