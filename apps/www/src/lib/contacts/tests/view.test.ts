import { describe, expect, it } from 'vitest';

import { contactMethods, formatContactCategory } from '../view';

describe('contact view helpers', () => {
  it('formats category labels', () => {
    expect(formatContactCategory('fence')).toBe('Забор');
  });

  it('builds display methods in stable order with safe hrefs', () => {
    expect(
      contactMethods({
        phone: '+7 900 000-00-00',
        telegram: 'https://t.me/example',
        whatsapp: 'https://wa.me/79000000000',
        email: 'team@example.com',
        website: 'https://example.com',
      }),
    ).toMatchInlineSnapshot(`
      [
        {
          "href": "tel:+79000000000",
          "label": "Телефон",
          "type": "phone",
          "value": "+7 900 000-00-00",
        },
        {
          "href": "https://t.me/example",
          "label": "Telegram",
          "type": "telegram",
          "value": "https://t.me/example",
        },
        {
          "href": "https://wa.me/79000000000",
          "label": "WhatsApp",
          "type": "whatsapp",
          "value": "https://wa.me/79000000000",
        },
        {
          "href": "mailto:team@example.com",
          "label": "Email",
          "type": "email",
          "value": "team@example.com",
        },
        {
          "href": "https://example.com",
          "label": "Сайт",
          "type": "website",
          "value": "https://example.com",
        },
      ]
    `);
  });
});
