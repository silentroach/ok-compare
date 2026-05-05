import { describe, expect, it } from 'vitest';

import { collections } from '@/content.config';

const schema = collections.peopleProfiles.schema as {
  safeParse: (value: unknown) => {
    readonly success: boolean;
    readonly error?: {
      readonly issues: readonly {
        readonly path: readonly (string | number)[];
        readonly message: string;
      }[];
    };
  };
};

describe('peopleProfiles collection schema', () => {
  it('accepts a valid person entry', () => {
    expect(
      schema.safeParse({
        name: 'Кирилл Щемелинин',
        name_cases: {
          gen: 'Кирилла Щемелинина',
        },
        company: 'ОК "Комфорт"',
        position: 'Исполняющий обязанности директора по эксплуатации',
        contacts: [
          {
            type: 'telegram',
            value: '@Kirill_ZemlyaMO',
          },
          {
            type: 'phone',
            value: '+7 (916) 555-12-34',
          },
        ],
      }).success,
    ).toBe(true);
  });

  it('rejects invalid contact types', () => {
    const result = schema.safeParse({
      name: 'Кирилл Щемелинин',
      contacts: [
        {
          type: 'email',
          value: 'kirill@example.com',
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('rejects blank names', () => {
    const result = schema.safeParse({
      name: '   ',
      contacts: [],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['name'],
        }),
      ]),
    );
  });

  it('rejects blank name case forms', () => {
    const result = schema.safeParse({
      name: 'Кирилл Щемелинин',
      name_cases: {
        gen: '   ',
      },
      contacts: [],
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['name_cases', 'gen'],
        }),
      ]),
    );
  });
});
