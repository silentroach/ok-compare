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
        "htmlUrl": "/people/kschemelinin/",
        "label": "Кирилл Щемелинин",
        "labelCases": {
          "gen": "Кирилла Щемелинина",
        },
        "linkTitle": "депутат, КПРФ",
        "markdownUrl": "/people/kschemelinin/index.md",
        "name": "Кирилл Щемелинин",
        "nameCases": {
          "gen": "Кирилла Щемелинина",
        },
        "position": "депутат",
        "slug": "kschemelinin",
        "type": "person",
      }
    `);
  });
});
