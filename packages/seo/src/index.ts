export const BRAND_KEYWORDS = [
  'Шелково',
  'Земля МО',
  'застройщик Земля МО',
  'ОК Комфорт',
  'обслуживающая компания ОК Комфорт',
  'Шелково Ривер',
  'Shelkovo River',
  'Шелково Форест',
  'Shelkovo Forest',
  'Шелково Парк',
  'Shelkovo Park',
  'Шелково Вилладж',
  'Shelkovo Village',
];

export const COMPARE_KEYWORDS = [
  ...BRAND_KEYWORDS,
  'сравнение тарифов поселков',
  'тарифы на обслуживание поселков',
  'коттеджные поселки Московская область',
];

type KeywordInput = string | string[] | undefined;

export function collectKeywords(...groups: KeywordInput[]): string[] {
  return Array.from(
    new Set(
      groups
        .flatMap((group) => {
          if (!group) return [];
          return Array.isArray(group) ? group : [group];
        })
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}
