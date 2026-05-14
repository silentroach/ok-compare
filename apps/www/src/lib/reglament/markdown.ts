import type { Estimate } from './schema';
import { absoluteUrl } from '../site';
import { buildReglamentPayload } from './discovery';
import {
  formatReglamentAnnualMoney,
  formatReglamentNumber,
  formatReglamentTariff,
} from './format';
import {
  reglamentApiCatalogUrl,
  reglamentEstimate2026DataUrl,
  reglamentEstimate2026OpenApiUrl,
  reglamentEstimate2026SchemaUrl,
  reglamentLlmsFullUrl,
  reglamentLlmsUrl,
  reglamentUrl,
} from './routes';

export const REGLAMENT_MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  'X-Robots-Tag': 'noindex, follow',
} as const;

const join = (lines: readonly string[]): string => `${lines.join('\n')}\n`;

const source = (
  ref: ReturnType<typeof buildReglamentPayload>['source_refs'][number],
): string => {
  const fragment = ref.fragment ? `, ${ref.fragment}` : '';
  const note = ref.note ? ` (${ref.note})` : '';

  return `[${ref.pdf}.pdf, стр. ${ref.page}${fragment}](${absoluteUrl(ref.pdf_url)})${note}`;
};

const rowLines = (
  row: ReturnType<
    typeof buildReglamentPayload
  >['sections'][number]['rows'][number],
): readonly string[] => [
  `- ${row.title} — ${formatReglamentTariff(row.baseline.tariff_per_sotka_month)}; ${formatReglamentAnnualMoney(row.baseline.annual_gross)}; источник: ${row.source_refs.map(source).join('; ')}`,
  ...(row.description ? [`  ${row.description}`] : []),
  ...(row.tags && row.tags.length > 0
    ? [`  Теги: ${row.tags.map((tag) => `\`${tag}\``).join(', ')}`]
    : []),
];

export function buildReglamentMarkdown(estimate: Estimate): string {
  const payload = buildReglamentPayload(estimate);

  return join([
    '# Калькулятор тарифа по смете 2026',
    '',
    'Текстовая версия интерактивной сметы регламента.',
    'В интерфейсе тариф показывается как ₽/сотка; машинное поле `tariff_per_sotka_month` остается месячным тарифом.',
    '',
    '## Главные URL',
    `- Раздел: ${absoluteUrl(reglamentUrl())}`,
    `- JSON сметы: ${absoluteUrl(reglamentEstimate2026DataUrl())}`,
    `- JSON Schema: ${absoluteUrl(reglamentEstimate2026SchemaUrl())}`,
    `- OpenAPI: ${absoluteUrl(reglamentEstimate2026OpenApiUrl())}`,
    `- API catalog: ${absoluteUrl(reglamentApiCatalogUrl())}`,
    `- llms.txt: ${absoluteUrl(reglamentLlmsUrl())}`,
    `- llms-full.txt: ${absoluteUrl(reglamentLlmsFullUrl())}`,
    ...payload.sources.map(
      (item) => `- Исходный PDF ${item.pdf}.pdf: ${absoluteUrl(item.pdf_url)}`,
    ),
    '',
    '## Итог',
    `- Официальный годовой итог: ${formatReglamentAnnualMoney(payload.official.annual_gross)}`,
    `- Официальный тариф: ${formatReglamentTariff(payload.official.tariff_per_sotka_month)}`,
    `- Расчетная база в JSON: ${formatReglamentAnnualMoney(payload.computed.annual_gross)}; ${formatReglamentTariff(payload.computed.tariff_per_sotka_month)}`,
    `- Тарифицируемая площадь: ${formatReglamentNumber(payload.tariff_area_sotki)} сотки`,
    '',
    '## Формулы',
    `- Тариф: \`${payload.formulas.tariff_per_sotka_month}\``,
    `- ФОТ: \`${payload.formulas.row_breakdown.fot}\``,
    `- Доходы всего: \`${payload.formulas.row_breakdown.income}\``,
    `- Сумма с НДС: \`${payload.formulas.row_breakdown.gross}\``,
    '',
    '## Ограничения',
    ...payload.caveats.map((item) => `- ${item}`),
    '',
    ...payload.sections.flatMap((section) => [
      `## ${section.title}`,
      `- Итог раздела: ${formatReglamentAnnualMoney(section.official.annual_gross)}; ${formatReglamentTariff(section.official.tariff_per_sotka_month)}`,
      '',
      ...section.rows.flatMap(rowLines),
      '',
    ]),
  ]);
}
