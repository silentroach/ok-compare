import {
  createMarkdownDocument,
  parseMarkdownFragment,
  serializeMarkdownDocument,
} from '@shelkovo/markdown';

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
  reglamentEstimateDetailsChecksMarkdownUrl,
  reglamentEstimateDetails2026DataUrl,
  reglamentEstimateDetailsLaborMarkdownUrl,
  reglamentEstimateDetailsMachinesMarkdownUrl,
  reglamentEstimateDetailsMarkdownUrl,
  reglamentEstimateDetailsMaterialsMarkdownUrl,
  reglamentEstimate2026DataUrl,
  reglamentEstimate2026OpenApiUrl,
  reglamentEstimate2026SchemaUrl,
  reglamentFullAssetsMarkdownUrl,
  reglamentFullChecksMarkdownUrl,
  reglamentFull2026DataUrl,
  reglamentFullMarkdownUrl,
  reglamentFullServiceMapMarkdownUrl,
  reglamentFullServicesMarkdownUrl,
  reglamentFullSourcePdfUrl,
  reglamentLlmsFullUrl,
  reglamentLlmsUrl,
  reglamentMarkdownUrl,
  reglamentServicesUrl,
  reglamentUrl,
} from './routes';
import type { EstimateRow } from './schema';

const SECTION_TITLES = new Set([
  'Описание',
  'Главные URL',
  'Как читать JSON',
  'Куда смотреть агенту',
  'Проект',
  'Канонические URL',
  'JSON',
  'Как выбирать источник',
  'Формулы',
  'Секции',
  'Ограничения',
]);

const serializeLlmsDocument = (lines: readonly string[]): string =>
  serializeMarkdownDocument(
    createMarkdownDocument({
      children: parseMarkdownFragment(
        lines
          .map((line, index) => {
            if (index === 0) return `# ${line}`;
            if (SECTION_TITLES.has(line)) return `## ${line}`;

            return line;
          })
          .join('\n'),
      ),
    }),
  );

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
  const fullAssetsMarkdown = absoluteUrl(reglamentFullAssetsMarkdownUrl());
  const fullServicesMarkdown = absoluteUrl(reglamentFullServicesMarkdownUrl());
  const fullServiceMapMarkdown = absoluteUrl(
    reglamentFullServiceMapMarkdownUrl(),
  );
  const fullChecksMarkdown = absoluteUrl(reglamentFullChecksMarkdownUrl());
  const detailsMarkdown = absoluteUrl(reglamentEstimateDetailsMarkdownUrl());
  const detailsMaterialsMarkdown = absoluteUrl(
    reglamentEstimateDetailsMaterialsMarkdownUrl(),
  );
  const detailsMachinesMarkdown = absoluteUrl(
    reglamentEstimateDetailsMachinesMarkdownUrl(),
  );
  const detailsLaborMarkdown = absoluteUrl(
    reglamentEstimateDetailsLaborMarkdownUrl(),
  );
  const detailsChecksMarkdown = absoluteUrl(
    reglamentEstimateDetailsChecksMarkdownUrl(),
  );
  const feed = absoluteUrl(reglamentEstimate2026DataUrl());
  const detailFeed = absoluteUrl(reglamentEstimateDetails2026DataUrl());
  const fullDataset = absoluteUrl(reglamentFull2026DataUrl());
  const fullSourcePdf = absoluteUrl(reglamentFullSourcePdfUrl());
  const assets = absoluteUrl(reglamentAssetsUrl());
  const services = absoluteUrl(reglamentServicesUrl());
  const short = absoluteUrl(reglamentLlmsUrl());
  const full = absoluteUrl(reglamentLlmsFullUrl());
  const catalog = absoluteUrl(reglamentApiCatalogUrl());
  const schema = absoluteUrl(reglamentEstimate2026SchemaUrl());
  const openapi = absoluteUrl(reglamentEstimate2026OpenApiUrl());

  const body =
    kind === 'short'
      ? [
          'Калькулятор тарифа по смете 2026',
          'Файл: llms.txt',
          'Язык: русский',
          '',
          'Описание',
          '- Это статический раздел `/815/regulation/` внутри kpshelkovo.online для интерактивной сметы тарифа 2026.',
          `- Исходный расчет: ${formatReglamentTariff(payload.official.tariff_per_sotka_month)} при годовом итоге ${formatReglamentAnnualMoney(payload.official.annual_gross)} и площади ${formatReglamentNumber(payload.tariff_area_sotki)} сотки.`,
          `- В JSON ${payload.sections.length} секций и ${rows} строк; PDF не парсятся во время запроса.`,
          '- В интерфейсе тариф показывается как ₽/сотка; машинное поле `tariff_per_sotka_month` остается месячным тарифом.',
          '',
          'Главные URL',
          `- Раздел: ${home}`,
          `- Markdown companion: ${markdown}`,
          `- Детальная смета Markdown: ${detailsMarkdown}`,
          `- Темы детальной сметы Markdown: ${detailsMaterialsMarkdown}, ${detailsMachinesMarkdown}, ${detailsLaborMarkdown}, ${detailsChecksMarkdown}`,
          `- Полный регламент Markdown: ${fullMarkdown}`,
          `- Темы полного регламента Markdown: ${fullAssetsMarkdown}, ${fullServicesMarkdown}, ${fullServiceMapMarkdown}, ${fullChecksMarkdown}`,
          `- JSON сметы: ${feed}`,
          `- JSON детальной сметы: ${detailFeed}`,
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
          '- `estimate-details-2026.json` хранит curated слой маленьких PDF: работы, ресурсы, контрольные итоги, source refs и needs_check.',
          '- `full-2026.json` хранит слой полного регламента: villages, common_assets, services, service_to_estimate_map, calculation_assumptions и audit_notes.',
          '- `details.md` является индексом; тематические markdown-файлы разбиты по материалам, машинам, труду и проверкам.',
          '- `full.md` является индексом; подробные markdown-файлы разбиты по имуществу, услугам, сопоставлениям и проверкам.',
          `- Формула тарифа: \`${REGLAMENT_FORMULAS.tariff_per_sotka_month}\`.`,
          '',
          'Куда смотреть агенту',
          '- Агрегированная смета: `estimate-2026.json` и `index.md` — разделы, строки, итоговые суммы, базовые частоты и breakdown.',
          '- Услуги полного регламента: `full-2026.json`, `full/services.md` и `full/service-map.md` — формулировки услуг, периодичность и связь со строками сметы.',
          '- Детальные ресурсы: `estimate-details-2026.json` и `details/*.md` — работы, материалы, машины, труд, подрядчики, контрольные итоги и `needs_check` из маленьких PDF.',
          '- Связки: `estimate_row_id` соединяет detail-факты с агрегированной сметой; `service_ids` соединяют work items с услугами полного регламента.',
          '- Пример проверки: для полива дорог сопоставьте услуги `summer-road-dust-suppression` и `summer-road-watering`, строку `cleaning-summer-mechanized` и detail-ресурсы полива.',
        ]
      : [
          'Калькулятор тарифа по смете 2026',
          'Файл: llms-full.txt',
          'Язык: русский',
          '',
          'Проект',
          '- Это машиночитаемый и текстовый слой страницы `/815/regulation/` с калькулятором тарифа по смете регламента 2026.',
          '- Данные уже нормализованы: агенту не нужно парсить PDF, чтобы начать проверку сметы.',
          '- В интерфейсе тариф показывается как ₽/сотка; машинное поле `tariff_per_sotka_month` остается месячным тарифом.',
          `- Официальный baseline: ${formatReglamentAnnualMoney(payload.official.annual_gross)} и ${formatReglamentTariff(payload.official.tariff_per_sotka_month)}.`,
          `- Расчетный baseline сейчас дает ${formatReglamentAnnualMoney(calculated.annual_gross)} и ${formatReglamentTariff(calculated.tariff_per_sotka_month)}.`,
          '',
          'Канонические URL',
          `- Раздел: ${home}`,
          `- Markdown companion: ${markdown}`,
          `- Детальная смета Markdown: ${detailsMarkdown}`,
          `- Детальная смета, материалы Markdown: ${detailsMaterialsMarkdown}`,
          `- Детальная смета, машины Markdown: ${detailsMachinesMarkdown}`,
          `- Детальная смета, труд Markdown: ${detailsLaborMarkdown}`,
          `- Детальная смета, проверки Markdown: ${detailsChecksMarkdown}`,
          `- Полный регламент Markdown: ${fullMarkdown}`,
          `- Полный регламент, имущество Markdown: ${fullAssetsMarkdown}`,
          `- Полный регламент, услуги Markdown: ${fullServicesMarkdown}`,
          `- Полный регламент, сопоставления Markdown: ${fullServiceMapMarkdown}`,
          `- Полный регламент, проверки Markdown: ${fullChecksMarkdown}`,
          `- Короткий агентный обзор: ${short}`,
          `- Расширенный агентный обзор: ${full}`,
          `- JSON сметы: ${feed}`,
          `- JSON детальной сметы: ${detailFeed}`,
          `- Dataset полного регламента: ${fullDataset}`,
          `- PDF полного регламента: ${fullSourcePdf}`,
          `- Общее имущество: ${assets}`,
          `- Услуги регламента: ${services}`,
          `- API catalog: ${catalog}`,
          `- JSON Schema: ${schema}`,
          `- OpenAPI: ${openapi}`,
          ...payload.sources.map(
            (item) => `- PDF ${item.pdf}.pdf: ${absoluteUrl(item.pdf_url)}`,
          ),
          '',
          'JSON',
          '- Корневой объект включает `id`, `year`, `title`, `tariff_area_sotki`, `coefficients`, `official`, `computed`, `formulas`, `source_refs`, `sources`, `caveats` и `sections`.',
          '- `sections[]` содержит официальный итог раздела, computed totals и строки.',
          '- `rows[]` содержит стабильный `id`, `title`, `kind`, `coefficient_policy`, baseline breakdown, computed breakdown, source refs и editable fields.',
          '- `source_refs[]` указывают PDF, страницу, фрагмент и публичный `pdf_url` исходного PDF.',
          '- Отдельный `estimate-details-2026.json` хранит детализацию маленьких PDF: work_items, resources, control_totals, source_refs и статусы проверки.',
          '- `details.md` хранит индекс детальной сметы, а `/815/regulation/details/*.md` разбивают ресурсы по материалам, машинам, труду и проверкам.',
          '- Отдельный `full-2026.json` хранит слой полного регламента без repo paths в source refs: имущество, услуги, сопоставления, расчетные допущения и audit notes.',
          '- `full.md` хранит обзор и индекс, а подробные markdown-файлы лежат в `/815/regulation/full/*.md`.',
          '',
          'Как выбирать источник',
          '- Агрегированная смета: `estimate-2026.json` и `index.md` — официальный baseline по разделам и строкам, базовые частоты, годовые суммы, формулы и breakdown.',
          '- Услуги полного регламента: `full-2026.json`, `full/services.md` и `full/service-map.md` — перечень услуг, периодичность, исходные формулировки и сопоставление с `estimate_row_id`.',
          '- Детальные ресурсы: `estimate-details-2026.json` и `details/*.md` — work items, resources, control totals, source refs и причины `needs_check` из маленьких PDF.',
          '- Практический порядок ответа: услуга и периодичность из full-слоя, строка и сумма из агрегированной сметы, состав ресурсов и проверки из detail-слоя.',
          '- Пример вопроса: для полива дорог сравните `summer-road-dust-suppression`, `summer-road-watering`, строку `cleaning-summer-mechanized` и detail-ресурсы воды/поливомоечной техники.',
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
        ];

  return serializeLlmsDocument(body);
}
