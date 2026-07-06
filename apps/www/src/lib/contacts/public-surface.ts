import type { PublicSurfaceSlice } from '@/lib/public-surface/types';

import {
  contactCategoryMarkdownPattern,
  contactCategoryPattern,
  contactMarkdownPattern,
  contactPattern,
  contactsMarkdownPath,
  contactsPath,
} from './routes';

export const contactsPublicSurfaceSlice = {
  owner: {
    id: 'contacts',
    label: 'Сарафан',
    entryPath: contactsPath(),
  },
  surfaces: [
    {
      id: 'contacts:index',
      label: 'Сарафан',
      path: contactsPath(),
      mediaType: 'text/html',
      cacheClass: 'html',
      discoveryRoles: ['section-entry'],
      catalogRole: 'anchor',
    },
    {
      id: 'contacts:index-markdown',
      label: 'Markdown-версия сарафана',
      path: contactsMarkdownPath(),
      mediaType: 'text/markdown',
      cacheClass: 'markdown',
      discoveryRoles: ['markdown-companion'],
      catalogRole: 'item',
    },
    {
      id: 'contacts:category',
      label: 'Раздел сарафана',
      routePattern: contactCategoryPattern(),
      mediaType: 'text/html',
      cacheClass: 'html',
      discoveryRoles: ['detail-page'],
    },
    {
      id: 'contacts:category-markdown',
      label: 'Markdown-версия раздела сарафана',
      routePattern: contactCategoryMarkdownPattern(),
      mediaType: 'text/markdown',
      cacheClass: 'markdown',
      discoveryRoles: ['markdown-companion'],
    },
    {
      id: 'contacts:contact',
      label: 'Страница контакта сарафана',
      routePattern: contactPattern(),
      mediaType: 'text/html',
      cacheClass: 'html',
      discoveryRoles: ['detail-page'],
    },
    {
      id: 'contacts:contact-markdown',
      label: 'Markdown-версия контакта сарафана',
      routePattern: contactMarkdownPattern(),
      mediaType: 'text/markdown',
      cacheClass: 'markdown',
      discoveryRoles: ['markdown-companion'],
    },
  ],
} satisfies PublicSurfaceSlice;
