import { beforeAll, describe, expect, it } from 'vitest';

let buildFullReglamentChecksMarkdown: typeof import('./full-markdown').buildFullReglamentChecksMarkdown;
let buildFullReglamentMarkdown: typeof import('./full-markdown').buildFullReglamentMarkdown;
let buildReglamentMarkdown: typeof import('./markdown').buildReglamentMarkdown;
let estimate2026: typeof import('@/data/reglament/estimate-2026').estimate2026;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ buildReglamentMarkdown } = await import('./markdown'));
  ({ buildFullReglamentChecksMarkdown, buildFullReglamentMarkdown } =
    await import('./full-markdown'));
  ({ estimate2026 } = await import('@/data/reglament/estimate-2026'));
});

describe('reglament markdown companions', () => {
  it('keeps overview URLs, source refs and formulas machine-readable', () => {
    const markdown = buildReglamentMarkdown(estimate2026);

    expect(markdown).toContain(
      '- Раздел: <https://example.com/815/regulation/>',
    );
    expect(markdown).toContain(
      '[final.pdf, стр. 1, строка 1.1](https://example.com/815/regulation/original/final.pdf)',
    );
    expect(markdown).toContain(
      '- Тариф: `annual_gross / tariff_area_sotki / 12`',
    );
  });

  it('keeps full-reglament thematic files as markdown links', () => {
    const markdown = buildFullReglamentMarkdown();

    expect(markdown).toContain(
      '- [Общее имущество](https://example.com/815/regulation/full/assets.md): перечень объектов, единицы измерения, итоги и ссылки на PDF',
    );
    expect(markdown).toContain(
      '- [Услуги регламента](https://example.com/815/regulation/full/services.md): перечень услуг, группы и периодичность из приложения №4',
    );
    expect(markdown).toContain(
      '- [Проверки и допущения](https://example.com/815/regulation/full/checks.md): ручная перепроверка, расчетные допущения и заметки аудита',
    );
  });

  it('keeps full-reglament ids, source refs and status codes machine-readable', () => {
    const markdown = buildFullReglamentChecksMarkdown();

    expect(markdown).toContain(String.raw`estimate\_rows:`);
    expect(markdown).toContain(
      '[full.pdf стр. 135, Приложение №4 / Круглогодично / строка 2](https://example.com/815/regulation/original/full.pdf)',
    );
    expect(markdown).toContain('`needs_check`');
  });
});
