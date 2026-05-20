import { describe, expect, it } from 'vitest';

import { createPersonMentionTarget } from './mentions';

describe('createPersonMentionTarget', () => {
  it('adapts person profile fields to the generic entity mention contract', () => {
    expect(
      createPersonMentionTarget(
        'kschemelinin',
        'Кирилл Щемелинин',
        { gen: 'Кирилла Щемелинина' },
        'КПРФ',
        'депутат',
      ),
    ).toMatchInlineSnapshot(`
      {
        "company": "КПРФ",
        "html_url": "/people/kschemelinin/",
        "label": "Кирилл Щемелинин",
        "label_cases": {
          "gen": "Кирилла Щемелинина",
        },
        "link_title": "депутат, КПРФ",
        "markdown_url": "/people/kschemelinin/index.md",
        "name": "Кирилл Щемелинин",
        "name_cases": {
          "gen": "Кирилла Щемелинина",
        },
        "position": "депутат",
        "slug": "kschemelinin",
        "type": "person",
      }
    `);
  });
});
