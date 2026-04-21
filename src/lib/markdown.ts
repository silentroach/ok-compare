import { loadAllData } from './data';
import { toExplorer } from './explorer';
import {
  calculateDistance,
  formatCurrency,
  formatDate,
  formatDistance,
  formatPercentage,
  formatTariff,
  formatTariffAuto,
  formatTariffOriginal,
  hasNonSotkaUnit,
} from './format';
import type { Rating } from './rating';
import type {
  AvailabilityStatus,
  ComparisonResult,
  DrainageType,
  RoadType,
  Settlement,
  SourceType,
  UndergroundElectricity,
  VideoSurveillance,
} from './schema';
import { getLotAverage } from './schema';
import { telegram, withBase } from './url';

const site = import.meta.env.SITE;

if (!site) {
  throw new Error('SITE is required to generate markdown companions');
}

const src = {
  official: 'официальный источник',
  community: 'сообщество',
  media: 'медиа',
  personal: 'личная коммуникация',
} as const satisfies Record<SourceType, string>;

const road = {
  asphalt: 'асфальт',
  partial_asphalt: 'частично асфальт',
  gravel: 'гравий',
  dirt: 'грунт',
} as const satisfies Record<RoadType, string>;

const drain = {
  closed: 'закрытый',
  open: 'открытый',
  none: 'нет',
} as const satisfies Record<DrainageType, string>;

const video = {
  full: 'полное',
  checkpoint_only: 'только на КПП',
  none: 'нет',
} as const satisfies Record<VideoSurveillance, string>;

const wire = {
  full: 'полностью подземное',
  partial: 'частично подземное',
  none: 'нет',
} as const satisfies Record<UndergroundElectricity, string>;

function abs(path: string): string {
  return new URL(withBase(path), site).toString();
}

function row(label: string, value?: string): string | undefined {
  if (!value) return;
  return `- ${label}: ${value}`;
}

function part(title: string, rows: string[]): string[] {
  return [
    `## ${title}`,
    ...(rows.length ? rows : ['- Нет подтвержденных данных.']),
    '',
  ];
}

function num(value: number): string {
  return value.toLocaleString('ru-RU', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  });
}

function lots(item: Settlement): string[] {
  if (!item.lots) return [];

  const avg = getLotAverage(item.lots, item.infrastructure, item.common_spaces);

  return [
    ...(item.lots.count
      ? [`- Количество участков/домовладений: ${num(item.lots.count)}`]
      : []),
    ...(item.lots.area_ha
      ? [`- Площадь поселка: ${num(item.lots.area_ha)} га`]
      : []),
    ...(avg
      ? [
          `- Средняя площадь участка: ${num(avg)} сот.${item.lots.average_sotka ? '' : ' (оценка с вычетом дорог, тротуаров, ливневок и общих зон)'}`,
        ]
      : []),
    ...(item.lots.average_note
      ? [`- Основание для средней площади: ${item.lots.average_note}`]
      : []),
  ];
}

function avail(value?: AvailabilityStatus): string | undefined {
  if (!value) return;
  if (value === 'yes') return 'есть';
  if (value === 'partial') return 'частично';
  return 'нет';
}

function infoRows(item: Settlement): string[] {
  return [
    row('Дороги', item.infrastructure.roads && road[item.infrastructure.roads]),
    row('Тротуары', avail(item.infrastructure.sidewalks)),
    row('Освещение', avail(item.infrastructure.lighting)),
    row('Газ', avail(item.infrastructure.gas)),
    row('Центральная вода', avail(item.infrastructure.water)),
    row('Центральная канализация', avail(item.infrastructure.sewage)),
    row(
      'Ливневка',
      item.infrastructure.drainage && drain[item.infrastructure.drainage],
    ),
    row('КПП', avail(item.infrastructure.checkpoints)),
    row('Охрана', avail(item.infrastructure.security)),
    row('Ограждение', avail(item.infrastructure.fencing)),
    row(
      'Видеонаблюдение',
      item.infrastructure.video_surveillance &&
        video[item.infrastructure.video_surveillance],
    ),
    row(
      'Подземное электричество',
      item.infrastructure.underground_electricity &&
        wire[item.infrastructure.underground_electricity],
    ),
    row('Административное здание', avail(item.infrastructure.admin_building)),
    row('Магазины и сервисы', avail(item.infrastructure.retail_or_services)),
  ].filter((item): item is string => Boolean(item));
}

function spaceRows(item: Settlement): string[] {
  return [
    row(
      'Клубная инфраструктура',
      avail(item.common_spaces.club_infrastructure),
    ),
    row('Детские площадки', avail(item.common_spaces.playgrounds)),
    row('Спорт', avail(item.common_spaces.sports)),
    row('Пешие маршруты', avail(item.common_spaces.walking_routes)),
    row('Доступ к воде', avail(item.common_spaces.water_access)),
    row('Пляжные зоны', avail(item.common_spaces.beach_zones)),
    row('BBQ-зоны', avail(item.common_spaces.bbq_zones)),
    row('Бассейн', avail(item.common_spaces.pool)),
    row('Фитнес-клуб', avail(item.common_spaces.fitness_club)),
    row('Ресторан', avail(item.common_spaces.restaurant)),
    row('SPA-центр', avail(item.common_spaces.spa_center)),
    row('Детский клуб', avail(item.common_spaces.kids_club)),
    row('Спортивный лагерь', avail(item.common_spaces.sports_camp)),
    row('Начальная школа', avail(item.common_spaces.primary_school)),
  ].filter((item): item is string => Boolean(item));
}

function serviceRows(item: Settlement): string[] {
  return [
    row('Вывоз мусора', avail(item.service_model.garbage_collection)),
    row('Уборка снега', avail(item.service_model.snow_removal)),
    row('Уборка дорог', avail(item.service_model.road_cleaning)),
    row('Благоустройство', avail(item.service_model.landscaping)),
    row('Аварийная служба', avail(item.service_model.emergency_service)),
    row('Диспетчер', avail(item.service_model.dispatcher)),
  ].filter((item): item is string => Boolean(item));
}

function delta(item: Settlement, cmp?: ComparisonResult): string {
  if (item.is_baseline) {
    return 'Базовый поселок для сравнения.';
  }

  if (!cmp) {
    return 'Сравнение с Шелково недоступно.';
  }

  if (cmp.tariffDelta === 0) {
    return 'Тариф совпадает с Шелково.';
  }

  return `${cmp.isCheaper ? 'Дешевле' : 'Дороже'} Шелково на ${formatCurrency(Math.abs(cmp.tariffDelta))} (${formatPercentage(Math.abs(cmp.tariffDeltaPercent), { signed: false })}).`;
}

function map(item: Settlement): string {
  return (
    item.location.map_url ??
    `https://yandex.ru/maps/?pt=${item.location.lng},${item.location.lat}&z=15&l=map`
  );
}

export async function buildHomeMd(): Promise<string> {
  const { settlements, stats, ratings } = await loadAllData();
  const list = toExplorer(settlements, ratings).sort((a, b) => {
    const d = b.rating - a.rating;
    if (d !== 0) return d;
    return a.short_name.localeCompare(b.short_name, 'ru');
  });
  const base = list.find((item) => item.is_baseline);
  const picks = [
    ...(base ? [base] : []),
    ...list.filter((item) => !item.is_baseline).slice(0, 5),
  ];

  const lines = [
    '# Сравни.Шелково',
    '',
    'Структурированное сравнение коттеджных поселков рядом с Шелково по тарифам, инфраструктуре, общественным пространствам, сервисной модели и условному рейтингу качества среды.',
    '',
    '## Ключевые ссылки',
    `- HTML: ${abs('/')}`,
    `- Markdown: ${abs('/index.md')}`,
    `- Полный feed: ${abs('/data/settlements.json')}`,
    `- Explorer feed: ${abs('/data/explorer.json')}`,
    `- Методика рейтинга: ${abs('/rating/')}`,
    `- Markdown-версия методики: ${abs('/rating/index.md')}`,
    '',
    '## Что здесь сравнивается',
    `- Поселков в базе: ${stats.totalSettlements}`,
    `- Базовый поселок: ${base ? `${base.name} (${abs(`/settlements/${base.slug}/`)})` : 'не найден'}`,
    `- Поселков дешевле Шелково: ${stats.cheaperCount}`,
    `- Поселков дороже Шелково: ${stats.moreExpensiveCount}`,
    '',
    '## Подборка поселков',
    ...picks.map(
      (item) =>
        `- ${item.name} — HTML: ${abs(`/settlements/${item.slug}/`)}; Markdown: ${abs(`/settlements/${item.slug}/index.md`)}; тариф ${formatTariffAuto(item.tariff)}; рейтинг ${num(item.rating)}/100; ${item.location.district}`,
    ),
    '',
    '## Markdown negotiation',
    '- HTML-маршруты `/`, `/rating/` и `/settlements/[slug]/` поддерживают `Accept: text/markdown`.',
    '- Прямые companion URLs: `/index.md`, `/rating/index.md`, `/settlements/[slug]/index.md`.',
    '',
    '## Ограничения данных',
    '- Если факт не подтвержден источником, поле опускается.',
    '- Отсутствие поля обычно означает «неизвестно», а не «точно нет».',
    '- `data/settlements.json` является основным полным structured feed поселков.',
    '- `data/explorer.json` сокращен для списка, карты и массового сравнения.',
    '- Тариф намеренно не входит в формулу условного рейтинга.',
  ];

  return `${lines.join('\n')}\n`;
}

export async function buildRatingMd(): Promise<string> {
  const lines = [
    '# Методика условного рейтинга поселков',
    '',
    'Markdown-версия страницы с публичным объяснением того, как считается условный уровень поселка.',
    '',
    '## Ключевые ссылки',
    `- HTML: ${abs('/rating/')}`,
    `- Markdown: ${abs('/rating/index.md')}`,
    `- Главная страница: ${abs('/')}`,
    '',
    '## Базовая формула',
    '- `rating = 100 * (infra * 0.50 + spaces * 0.25 + service * 0.10 + distance * 0.15)`',
    '- Тариф не влияет на рейтинг и исключен из формулы специально.',
    '',
    '## Блоки и веса',
    '- Инфраструктура: 50%',
    '- Общественные пространства: 25%',
    '- Сервисная модель: 10%',
    '- Близость к Москве: 15%',
    '',
    '## Как считаются признаки',
    '- Для бинарных статусов используется шкала `yes = 1`, `partial = 0.5`, `no = 0`.',
    '- Для упорядоченных признаков применяются отдельные шкалы: дороги, ливневка, видеонаблюдение и подземное электричество.',
    '- Неизвестные поля не трактуются как `no`.',
    '- Если данных мало, оценка блока тянется к нейтральной середине `0.5`, а не к верхней или нижней границе.',
    '',
    '## Дистанция',
    '- Используется расстояние не от центра Москвы напрямую, а приблизительное расстояние за пределами МКАД.',
    '- До 20 км за МКАД блок получает максимум.',
    '- Дальше оценка плавно снижается по диапазонам `20..40`, `40..60`, `60..80`, `80..100`, затем фиксируется на минимуме.',
    '',
    '## Дополнительные корректировки',
    '- `water_in_tariff = true`: `+4` к рейтингу.',
    '- `rabstvo = true`: `-15` к рейтингу.',
    '',
    '## Как читать результат',
    '- Это технический прокси качества среды, а не рыночная оценка недвижимости.',
    '- Сначала сравнивается сила поселка по среде, потом отдельно смотрится тариф.',
    '- Полная визуальная версия с пояснениями и разделами доступна по HTML-ссылке выше.',
  ];

  return `${lines.join('\n')}\n`;
}

interface Page {
  settlement: Settlement;
  comparison?: ComparisonResult;
  shelkovo?: Settlement;
  rating?: Rating;
}

export function buildSettlementMd({
  settlement,
  comparison,
  shelkovo,
  rating,
}: Page): string {
  const html = abs(`/settlements/${settlement.slug}/`);
  const md = abs(`/settlements/${settlement.slug}/index.md`);
  const tg = settlement.telegram ? telegram(settlement.telegram) : undefined;
  const dist =
    shelkovo && !settlement.is_baseline
      ? formatDistance(
          calculateDistance(
            shelkovo.location.lat,
            shelkovo.location.lng,
            settlement.location.lat,
            settlement.location.lng,
          ),
        )
      : undefined;
  const company = settlement.management_company;
  const companyLine =
    typeof company === 'string'
      ? company
      : company
        ? `${company.title} — ${company.url}`
        : undefined;
  const score = rating ? `${num(rating.score)}/100` : undefined;

  const lines = [
    `# ${settlement.name}`,
    '',
    `- HTML: ${html}`,
    `- Markdown: ${md}`,
    `- Район: ${settlement.location.district}`,
    `- Адрес: ${settlement.location.address_text}`,
    `- Тариф: ${formatTariffOriginal(settlement.tariff)}`,
    ...(hasNonSotkaUnit(settlement.tariff)
      ? [
          `- Средняя за сотку: ${settlement.tariff.normalized_is_estimate ? '~' : ''}${formatTariff(settlement.tariff.normalized_per_sotka_month)} в месяц`,
        ]
      : []),
    ...(settlement.tariff.note
      ? [`- Примечание к тарифу: ${settlement.tariff.note}`]
      : []),
    ...lots(settlement),
    ...(score ? [`- Условный рейтинг: ${score}`] : []),
    ...(rating
      ? [`- Примерное расстояние от Москвы: ${formatDistance(rating.km)}`]
      : []),
    ...(rating
      ? [`- Примерное расстояние за МКАД: ${formatDistance(rating.ring)}`]
      : []),
    ...(dist ? [`- Расстояние от Шелково: ${dist}`] : []),
    `- Сравнение с Шелково: ${delta(settlement, comparison)}`,
    ...(settlement.is_baseline ? ['- Базовый поселок: да'] : []),
    ...(settlement.water_in_tariff ? ['- Вода уже включена в тариф: да'] : []),
    ...(settlement.rabstvo
      ? ['- Есть подтвержденное упоминание в «Коттеджном рабстве»: да']
      : []),
    ...(companyLine ? [`- Управляющая компания: ${companyLine}`] : []),
    `- Сайт: ${settlement.website}`,
    ...(tg ? [`- Telegram: ${tg}`] : []),
    `- Карта: ${map(settlement)}`,
    '',
    '- Отсутствующие признаки в разделах ниже означают, что данные не подтверждены источниками.',
    '',
    ...part('Инфраструктура', infoRows(settlement)),
    ...part('Общественные пространства', spaceRows(settlement)),
    ...part('Сервисная модель', serviceRows(settlement)),
    '## Источники',
    ...settlement.sources.map((item) => {
      const info = [
        formatDate(item.date_checked),
        src[item.type],
        item.title,
      ].join(' — ');
      if (item.comment) {
        return `- ${info}: ${item.url} (${item.comment})`;
      }
      return `- ${info}: ${item.url}`;
    }),
  ];

  return `${lines.join('\n')}\n`;
}
