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

  it('renders labelled people mentions with author text preserved', () => {
    const registry = new Map([
      [
        'kschemelinin',
        createPersonMentionTarget('kschemelinin', 'Кирилл Щемелинин'),
      ],
    ]);

    expect(
      renderMarkdown('По словам [главного по электричеству](@kschemelinin).', {
        people: {
          registry,
          context: 'test markdown',
        },
      }),
    ).toBe(
      '<p>По\u00A0словам <a href="/people/kschemelinin/">главного по\u00A0электричеству</a>.</p>',
    );
  });
});
