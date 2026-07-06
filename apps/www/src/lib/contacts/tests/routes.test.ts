import { describe, expect, it } from 'vitest';

import {
  contactCanonical,
  contactMarkdownPattern,
  contactMarkdownUrl,
  contactPattern,
  contactsMarkdownUrl,
  contactsUrl,
  contactUrl,
} from '../routes';

describe('contact routes', () => {
  it('builds stable index and detail URLs', () => {
    const contact = { slug: 'ivan-petrov-fence' };

    expect(contactsUrl()).toBe('/contacts/');
    expect(contactsMarkdownUrl()).toBe('/contacts/index.md');
    expect(contactUrl(contact)).toBe('/contacts/ivan-petrov-fence/');
    expect(contactMarkdownUrl(contact)).toBe(
      '/contacts/ivan-petrov-fence/index.md',
    );
    expect(contactCanonical(contact)).toBe(
      'https://kpshelkovo.online/contacts/ivan-petrov-fence/',
    );
  });

  it('rejects malformed slugs before building public URLs', () => {
    expect(() => contactUrl({ slug: 'Bad Slug' })).toThrow(/contact slug/u);
  });

  it('exposes route patterns for public surface registration', () => {
    expect(contactPattern()).toBe('/contacts/:slug/');
    expect(contactMarkdownPattern()).toBe('/contacts/:slug/index.md');
  });
});
