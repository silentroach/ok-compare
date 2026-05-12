import { describe, expect, it } from 'vitest';

import { createPersonMentionTarget } from '../people/mentions';
import { renderMarkdown } from './render';

describe('renderMarkdown', () => {
  it('renders markdown with app-level people mentions processing', () => {
    const registry = new Map([
      [
        'kschemelinin',
        createPersonMentionTarget('kschemelinin', 'Кирилл Щемелинин', {
          gen: 'Кирилла Щемелинина',
        }),
      ],
    ]);

    expect(
      renderMarkdown('По словам @kschemelinin:gen, работы идут.', {
        people: {
          registry,
          context: 'test markdown',
        },
      }),
    ).toBe(
      '<p>По\u00A0словам <a href="/people/kschemelinin/">Кирилла Щемелинина</a>, работы идут.</p>',
    );
  });
});
