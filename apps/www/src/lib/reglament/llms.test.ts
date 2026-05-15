import { beforeAll, describe, expect, it } from 'vitest';

let build: typeof import('./llms').build;

beforeAll(async () => {
  Object.assign(import.meta.env, {
    SITE: 'https://example.com',
    BASE_URL: '/',
  });

  ({ build } = await import('./llms'));
});

describe('reglament llms', () => {
  it('serializes the short agent overview as Markdown AST output', () => {
    expect(build('short').split('\n').slice(0, 18).join('\n'))
      .toMatchInlineSnapshot(`
      "# Калькулятор тарифа по смете 2026

      Файл: llms.txt
      Язык: русский

      ## Описание

      - Это статический раздел \`/815/regulation/\` внутри kpshelkovo.online для интерактивной сметы тарифа 2026.
      - Исходный расчет: 902,07 ₽/сотка при годовом итоге 221 264 198 ₽/год и площади 20 440,54 сотки.
      - В JSON 7 секций и 19 строк; PDF не парсятся во время запроса.
      - В интерфейсе тариф показывается как ₽/сотка; машинное поле \`tariff_per_sotka_month\` остается месячным тарифом.

      ## Главные URL

      - Раздел: <https://example.com/815/regulation/>
      - Markdown companion: <https://example.com/815/regulation/index.md>
      - Детальная смета Markdown: <https://example.com/815/regulation/details.md>
      - Темы детальной сметы Markdown: <https://example.com/815/regulation/details/materials.md>, <https://example.com/815/regulation/details/machines.md>, <https://example.com/815/regulation/details/labor.md>, <https://example.com/815/regulation/details/checks.md>"
    `);
  });
});
