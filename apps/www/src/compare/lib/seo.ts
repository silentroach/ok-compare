import { BRAND_KEYWORDS, collectKeywords } from '@shelkovo/seo';

import { formatCurrency, formatTariffAuto } from './format';
import type { ComparisonResult, Settlement } from './schema';

export const COMPARE_PRODUCT_NAME = 'Сравни с Шелково';

const SHORT_COMPANY_LENGTH = 18;

export const COMPARE_KEYWORDS = [
  ...BRAND_KEYWORDS,
  COMPARE_PRODUCT_NAME,
  'сравнение тарифов поселков',
  'тарифы на обслуживание поселков',
  'коттеджные поселки Московская область',
];

const compareTitle = (title: string): string =>
  `${title} — ${COMPARE_PRODUCT_NAME}`;

const cleanCompanyName = (title: string): string =>
  title.replaceAll('"', '').replace(/\s+/g, ' ').trim();

const companyTitle = (settlement: Settlement): string | undefined => {
  const company = settlement.management_company;
  if (!company) return;

  return typeof company === 'string' ? company : company.title;
};

const companyName = (settlement: Settlement): string | undefined => {
  const title = companyTitle(settlement);
  if (!title) return;

  const name = cleanCompanyName(title);
  return name || undefined;
};

const companyDescription = (settlement: Settlement): string | undefined => {
  const name = companyName(settlement);

  if (!name || name.length > SHORT_COMPANY_LENGTH) return;

  return `Обслуживает ${name}.`;
};

const deltaDescription = (
  settlement: Settlement,
  comparison: ComparisonResult | undefined,
): string | undefined => {
  if (settlement.is_baseline) return 'Базовый поселок для сравнения.';
  if (!comparison) return;
  if (comparison.tariffDelta === 0) return 'Тариф как в Шелково.';

  return `${comparison.isCheaper ? 'Дешевле' : 'Дороже'} Шелково на ${formatCurrency(Math.abs(comparison.tariffDelta))}.`;
};

export const compareHomeMeta = (totalSettlements: number) => ({
  title: compareTitle('Сравнение поселков'),
  description: `Сравните ${totalSettlements} поселков по тарифам, инфраструктуре и сервисам: карточки, карта и разница с Шелково в одном месте.`,
  keywords: collectKeywords(COMPARE_KEYWORDS),
});

export const compareRatingMeta = () => ({
  title: compareTitle('Как считается уровень поселка'),
  description:
    'Методика расчета уровня поселка: какие факторы входят в оценку, как учитываются неизвестные данные и почему тариф не влияет на формулу.',
  keywords: collectKeywords(
    COMPARE_KEYWORDS,
    'рейтинг поселков',
    'уровень поселка',
    'методика рейтинга поселков',
  ),
});

export const settlementPageMeta = (
  settlement: Settlement,
  comparison: ComparisonResult | undefined,
) => {
  const title = companyTitle(settlement);
  const name = companyName(settlement);
  const description = [
    `${settlement.short_name}, ${settlement.location.district}.`,
    companyDescription(settlement),
    `Тариф ${formatTariffAuto(settlement.tariff)} в месяц.`,
    deltaDescription(settlement, comparison),
  ]
    .filter((item): item is string => Boolean(item))
    .join(' ');

  return {
    title: compareTitle(`${settlement.short_name}: тариф и инфраструктура`),
    description,
    keywords: collectKeywords(
      COMPARE_KEYWORDS,
      settlement.name,
      settlement.short_name,
      `коттеджный поселок ${settlement.short_name}`,
      settlement.location.district,
      title,
      name,
    ),
  };
};
