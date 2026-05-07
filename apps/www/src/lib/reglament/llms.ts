import { estimate2026 } from '@/data/reglament/estimate-2026';

import { absoluteUrl } from '../site';
import { calculateEstimate } from './calculate';
import {
  REGLAMENT_CAVEATS,
  REGLAMENT_FORMULAS,
  buildReglamentPayload,
} from './discovery';
import {
  formatReglamentAnnualMoney,
  formatReglamentNumber,
  formatReglamentTariff,
} from './format';
import {
  reglamentApiCatalogUrl,
  reglamentAssetsUrl,
  reglamentEstimate2026DataUrl,
  reglamentEstimate2026OpenApiUrl,
  reglamentEstimate2026SchemaUrl,
  reglamentFull2026DataUrl,
  reglamentFullMarkdownUrl,
  reglamentFullSourcePdfUrl,
  reglamentLlmsFullUrl,
  reglamentLlmsUrl,
  reglamentMarkdownUrl,
  reglamentServicesUrl,
  reglamentUrl,
} from './routes';
import type { EstimateRow } from './schema';

const join = (lines: readonly string[]): string => `${lines.join('\n')}\n`;

const rowsCount = (rows: readonly EstimateRow[]): number =>
  rows.reduce((total, row) => total + 1 + rowsCount(row.children ?? []), 0);

export function build(kind: 'short' | 'full'): string {
  const payload = buildReglamentPayload(estimate2026);
  const calculated = calculateEstimate(estimate2026);
  const rows = estimate2026.sections.reduce(
    (total, section) => total + rowsCount(section.rows),
    0,
  );

  const home = absoluteUrl(reglamentUrl());
  const markdown = absoluteUrl(reglamentMarkdownUrl());
  const fullMarkdown = absoluteUrl(reglamentFullMarkdownUrl());
  const feed = absoluteUrl(reglamentEstimate2026DataUrl());
  const fullDataset = absoluteUrl(reglamentFull2026DataUrl());
  const fullSourcePdf = absoluteUrl(reglamentFullSourcePdfUrl());
  const assets = absoluteUrl(reglamentAssetsUrl());
  const services = absoluteUrl(reglamentServicesUrl());
  const short = absoluteUrl(reglamentLlmsUrl());
  const full = absoluteUrl(reglamentLlmsFullUrl());
  const catalog = absoluteUrl(reglamentApiCatalogUrl());
  const schema = absoluteUrl(reglamentEstimate2026SchemaUrl());
  const openapi = absoluteUrl(reglamentEstimate2026OpenApiUrl());

  return kind === 'short'
    ? join([
        'Калькулятор тарифа по смете 2026',
        'Файл: llms.txt',
        'Язык: русский',
        '',
        'Описание',
        '- Это статический раздел `/reglament/` внутри kpshelkovo.online для интерактивной сметы тарифа 2026.',
        `- Исходный расчет: ${formatReglamentTariff(payload.official.tariff_per_sotka_month)} при годовом итоге ${formatReglamentAnnualMoney(payload.official.annual_gross)} и площади ${formatReglamentNumber(payload.tariff_area_sotki)} сотки.`,
        `- В JSON ${payload.sections.length} секций и ${rows} строк; PDF не парсятся во время запроса.`,
        '- UI-лейбл: ₽/сотка; машинное поле `tariff_per_sotka_month` остается месячным тарифом.',
        '',
        'Главные URL',
        `- Раздел: ${home}`,
        `- Markdown companion: ${markdown}`,
        `- Полный регламент Markdown: ${fullMarkdown}`,
        `- JSON сметы: ${feed}`,
        `- Dataset полного регламента: ${fullDataset}`,
        `- PDF полного регламента: ${fullSourcePdf}`,
        `- Общее имущество: ${assets}`,
        `- Услуги регламента: ${services}`,
        `- API catalog: ${catalog}`,
        `- JSON Schema: ${schema}`,
        `- OpenAPI: ${openapi}`,
        `- Расширенная версия этого текста: ${full}`,
        `- Исходные PDF: ${payload.sources.map((item) => absoluteUrl(item.pdf_url)).join(', ')}`,
        '',
        'Как читать JSON',
        '- `official` хранит значения из итоговой сметы, `computed` хранит baseline, пересчитанный расчетным движком.',
        '- `sections[].rows[]` включает baseline, computed, source refs, editable fields, tags и breakdown.',
        '- `full-2026.json` хранит слой полного регламента: villages, common_assets, services, service_to_estimate_map, calculation_assumptions и audit_notes.',
        `- Формула тарифа: \`${REGLAMENT_FORMULAS.tariff_per_sotka_month}\`.`,
      ])
    : join([
        'Калькулятор тарифа по смете 2026',
        'Файл: llms-full.txt',
        'Язык: русский',
        '',
        'Проект',
        '- Это машиночитаемый и текстовый слой страницы `/reglament/` с калькулятором тарифа по смете регламента 2026.',
        '- Раздел строится на нормализованном статическом модуле данных, без клиентского парсинга PDF и без mutation endpoints.',
        '- UI-лейбл: ₽/сотка; машинное поле `tariff_per_sotka_month` остается месячным тарифом.',
        `- Официальный baseline: ${formatReglamentAnnualMoney(payload.official.annual_gross)} и ${formatReglamentTariff(payload.official.tariff_per_sotka_month)}.`,
        `- Расчетный baseline сейчас дает ${formatReglamentAnnualMoney(calculated.annual_gross)} и ${formatReglamentTariff(calculated.tariff_per_sotka_month)}.`,
        '',
        'Канонические URL',
        `- Раздел: ${home}`,
        `- Markdown companion: ${markdown}`,
        `- Полный регламент Markdown: ${fullMarkdown}`,
        `- Короткий агентный обзор: ${short}`,
        `- Расширенный агентный обзор: ${full}`,
        `- JSON сметы: ${feed}`,
        `- Dataset полного регламента: ${fullDataset}`,
        `- PDF полного регламента: ${fullSourcePdf}`,
        `- Общее имущество: ${assets}`,
        `- Услуги регламента: ${services}`,
        `- API catalog: ${catalog}`,
        `- JSON Schema: ${schema}`,
        `- OpenAPI: ${openapi}`,
        ...payload.sources.map(
          (item) =>
            `- PDF ${item.pdf}.pdf: ${absoluteUrl(item.pdf_url)} (repo: ${item.pdf_path})`,
        ),
        '',
        'JSON',
        '- Корневой объект включает `id`, `year`, `title`, `tariff_area_sotki`, `coefficients`, `official`, `computed`, `formulas`, `source_refs`, `sources`, `caveats` и `sections`.',
        '- `sections[]` содержит официальный итог раздела, computed totals и строки.',
        '- `rows[]` содержит стабильный `id`, `title`, `kind`, `coefficient_policy`, baseline breakdown, computed breakdown, source refs и editable fields.',
        '- `source_refs[]` указывают PDF, страницу, фрагмент, public `pdf_url` и repo path исходного PDF.',
        '- Отдельный `full-2026.json` хранит слой полного регламента без repo paths в source refs: имущество, услуги, сопоставления, расчетные допущения и audit notes.',
        '',
        'Формулы',
        `- Тариф: \`${REGLAMENT_FORMULAS.tariff_per_sotka_month}\``,
        `- ФОТ: \`${REGLAMENT_FORMULAS.row_breakdown.fot}\``,
        `- Direct: \`${REGLAMENT_FORMULAS.row_breakdown.direct}\``,
        `- Gross: \`${REGLAMENT_FORMULAS.row_breakdown.gross}\``,
        '',
        'Секции',
        ...payload.sections.map(
          (section) =>
            `- ${section.title}: ${formatReglamentAnnualMoney(section.official.annual_gross)}; ${formatReglamentTariff(section.official.tariff_per_sotka_month)}; строк: ${section.rows.length}`,
        ),
        '',
        'Ограничения',
        ...REGLAMENT_CAVEATS.map((item) => `- ${item}`),
      ]);
}
