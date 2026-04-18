import { loadAllData } from './data';
import { withBase } from './url';

const site = import.meta.env.SITE;
const fix = 'https://t.me/silentroach';

if (!site) {
  throw new Error('SITE is required to generate llms.txt');
}

function abs(path: string): string {
  return new URL(withBase(path), site).toString();
}

function refs(list: Array<{ short_name: string; slug: string }>): string[] {
  return list.map(
    (item) => `- ${item.short_name}: ${abs(`/settlements/${item.slug}/`)}`,
  );
}

export async function build(kind: 'short' | 'full'): Promise<string> {
  const { settlements, stats, ratings } = await loadAllData();
  const base = settlements.find((item) => item.is_baseline);
  const top = settlements
    .filter((item) => !item.is_baseline)
    .sort((a, b) => {
      const d =
        (ratings.get(b.slug)?.score ?? 0) - (ratings.get(a.slug)?.score ?? 0);
      if (d !== 0) return d;
      return a.short_name.localeCompare(b.short_name, 'ru');
    })
    .slice(0, 2);
  const list = [...(base ? [base] : []), ...top];
  const home = abs('/');
  const rating = abs('/rating/');
  const feed = abs('/data/settlements.json');
  const explorer = abs('/data/explorer.json');
  const short = abs('/llms.txt');
  const full = abs('/llms-full.txt');
  const skills = abs('/.well-known/agent-skills/index.json');

  const body =
    kind === 'short'
      ? [
          'Сравни.Шелково',
          'Файл: llms.txt',
          'Язык: русский',
          '',
          'Описание',
          '- Статический сайт для сравнения тарифов на содержание коттеджных поселков рядом с Шелково.',
          '- Сайт сравнивает тарифы, базовую инфраструктуру, общественные пространства, сервисную модель и условный рейтинг качества среды.',
          `- Сейчас в базе ${stats.totalSettlements} поселков.`,
          '',
          'Главные URL',
          `- Главная: ${home}`,
          `- Методика рейтинга: ${rating}`,
          `- Основной полный машиночитаемый feed: ${feed}`,
          `- Облегченный explorer feed: ${explorer}`,
          `- Индекс agent skills: ${skills}`,
          `- Расширенная версия этого текста: ${full}`,
          '- Примеры детальных страниц:',
          ...refs(list),
          '',
          'Ограничения данных',
          '- `data/settlements.json` теперь основной полный structured feed для агентов.',
          '- `data/explorer.json` сохранен как облегченный feed для списка, карты и минимального payload.',
          '- Список `sources` остается на детальных страницах и не входит в общий feed.',
          '- Если факт не подтвержден источником, поле может быть опущено.',
          '- Тариф не входит в формулу условного рейтинга.',
          '',
          'Исправления и уточнения',
          `- Если нашли неточность или хотите передать дополнительные данные: ${fix}`,
        ]
      : [
          'Сравни.Шелково',
          'Файл: llms-full.txt',
          'Язык: русский',
          '',
          'Проект',
          '- Это статический русскоязычный сайт для сравнения тарифов на содержание коттеджных поселков рядом с Шелково.',
          '- Сайт нужен для сопоставления цены и подтвержденных признаков среды: инженерной инфраструктуры, общественных пространств, сервисной модели и условного рейтинга.',
          `- Сейчас в базе ${stats.totalSettlements} поселков.`,
          '',
          'Канонические URL',
          `- Главная: ${home}`,
          `- Короткий агентный обзор: ${short}`,
          `- Расширенный агентный обзор: ${full}`,
          `- Методика рейтинга: ${rating}`,
          `- Основной полный машиночитаемый feed: ${feed}`,
          `- Облегченный explorer feed: ${explorer}`,
          `- Индекс agent skills: ${skills}`,
          '- Примеры детальных страниц поселков:',
          ...refs(list),
          '',
          'Описание data/settlements.json',
          '- Это основной полный structured feed для агентов и машинного обхода базы.',
          '- Структура `settlements[]` включает подтвержденные поля карточки поселка: `name`, `short_name`, `slug`, `website`, `telegram`, `management_company`, полный `location`, полный `tariff`, `water_in_tariff`, `rabstvo`, `infrastructure`, `common_spaces`, `service_model`, вычисленное поле `rating` и объект `distance` с `moscow_km`, `mkad_km`, `shelkovo_km`.',
          '- Поле `rating` сериализуется как число `0..100` и служит техническим прокси качества среды для сортировки и сравнения.',
          '- Объект `comparisons` индексируется по `slug` и содержит `tariffDelta`, `tariffDeltaPercent` и `isCheaper` относительно базового поселка Шелково.',
          '- Объект `stats` содержит агрегированные показатели по тарифам и общее число поселков.',
          '- Список первоисточников `sources` в общий feed не включен; за ним нужно идти на detail-страницу поселка.',
          '',
          'Описание data/explorer.json',
          '- Это отдельный облегченный feed для главного списка и карты, а не основной источник для агентов.',
          '- Его `settlements[]` включает только `name`, `short_name`, `slug`, `rating`, `is_baseline`, `location.lat`, `location.lng`, `location.district`, `tariff.normalized_per_sotka_month`, `tariff.normalized_is_estimate`, а также опциональные `rabstvo` и сокращенный `management_company`.',
          '- Используйте его только когда нужен минимальный payload для массовой первичной выборки или повторения логики главной страницы.',
          '',
          'Детальные страницы поселков',
          '- Страницы вида `/settlements/[slug]/` остаются каноническим человекочитаемым представлением по одному поселку.',
          '- Они удобны, когда нужно дать ссылку на HTML или Markdown-страницу, а не только забрать структурированные данные.',
          '- Если нужна максимально полная структурированная картина, сначала используйте `data/settlements.json`, а затем переходите на детальную страницу по `slug`.',
          '',
          'Рейтинг',
          '- Условный рейтинг считается на этапе сборки и не является интегральной ценой жизни или рыночной оценкой недвижимости.',
          '- Тариф намеренно исключен из формулы.',
          '- Базовые блоки рейтинга: инфраструктура, общественные пространства, сервисная модель и удаленность от Москвы.',
          '- Если данных мало, карточка тянется к нейтральной середине шкалы, а не трактуется автоматически как слабая или сильная.',
          `- Публичное объяснение методики: ${rating}`,
          '',
          'Ограничения данных',
          '- Если факт не подтвержден источником, поле может быть опущено.',
          '- Отсутствие поля обычно означает «неизвестно», а не «точно нет».',
          '- Основной язык сайта русский; названия поселков, разделов и часть полей заданы по-русски.',
          '- `data/explorer.json` оптимизирован для списка и карты и не заменяет полный feed `data/settlements.json`.',
          '',
          'Исправления и уточнения',
          `- Если нашли неточность или хотите передать дополнительные данные: ${fix}`,
        ];

  return `${body.join('\n')}\n`;
}
