import { describe, expect, it } from 'vitest';

import { createPersonMentionTarget } from '../people/mentions';
import {
  preprocessSiteMarkdown,
  preprocessSiteMarkdownContent,
  renderMarkdown,
} from './render';

describe('renderMarkdown', () => {
  it('preprocesses loader body content through the shared app pipeline', () => {
    const registry = new Map([
      [
        'kschemelinin',
        createPersonMentionTarget('kschemelinin', 'Кирилл Щемелинин'),
      ],
    ]);

    expect(
      preprocessSiteMarkdownContent(
        'Работы подтвердил @kschemelinin.\n\n',
        'test body',
        registry,
      ),
    ).toEqual({
      markdown: 'Работы подтвердил [Кирилл Щемелинин](/people/kschemelinin/).',
      mentions: [registry.get('kschemelinin')],
    });
  });

  it('keeps blank loader body content mention-free', () => {
    expect(
      preprocessSiteMarkdownContent('  \n', 'test body', new Map()),
    ).toEqual({
      markdown: '',
      mentions: [],
    });
  });

  it('passes source entity validation for loader body content', () => {
    const registry = new Map([
      [
        'kschemelinin',
        createPersonMentionTarget('kschemelinin', 'Кирилл Щемелинин'),
      ],
    ]);

    expect(() =>
      preprocessSiteMarkdownContent(
        'Автобиография @kschemelinin.',
        'test body',
        registry,
        {
          type: 'person',
          slug: 'kschemelinin',
        },
      ),
    ).toThrow('test body contains self entity mention "person:kschemelinin"');
  });

  it('preprocesses app-level people mentions and returns mention metadata', () => {
    const registry = new Map([
      [
        'kschemelinin',
        createPersonMentionTarget('kschemelinin', 'Кирилл Щемелинин'),
      ],
    ]);

    expect(
      preprocessSiteMarkdown('Работы подтвердил @kschemelinin.', {
        mentions: {
          registry,
          context: 'test markdown',
        },
      }),
    ).toEqual({
      markdown: 'Работы подтвердил [Кирилл Щемелинин](/people/kschemelinin/).',
      mentions: [registry.get('kschemelinin')],
    });
  });

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
        mentions: {
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
        mentions: {
          registry,
          context: 'test markdown',
        },
      }),
    ).toBe(
      '<p>По\u00A0словам <a href="/people/kschemelinin/">главного по\u00A0электричеству</a>.</p>',
    );
  });
});
