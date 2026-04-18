<script lang="ts">
  import { onMount } from 'svelte';
  import type { ExplorerPayload, ExplorerSettlement } from '../lib/explorer';
  import {
    calculateDistance,
    formatTariffAuto,
    getTariffHint,
  } from '../lib/format';
  import { getRing } from '../lib/rating';
  import { rankSettlements } from '../lib/stats';
  import Link from './Link.svelte';
  import SettlementMap from './SettlementMap.svelte';
  import SettlementCard from './SettlementCard.svelte';

  interface Props {
    settlements?: ExplorerSettlement[];
    comparisons?: ExplorerPayload['comparisons'];
    stats?: ExplorerPayload['stats'];
    dataUrl?: string;
  }

  let {
    settlements = [] as ExplorerSettlement[],
    comparisons = {} as ExplorerPayload['comparisons'],
    stats,
    dataUrl = '',
  }: Props = $props();

  const uid = $props.id();
  const allid = `${uid}-price-all`;
  const cheapid = `${uid}-price-cheaper`;
  const moreid = `${uid}-price-more`;
  const sortid = `${uid}-sort`;
  const mapid = `${uid}-map`;

  let ready = $derived(settlements.length > 0 || dataUrl.length === 0);
  let tryid = $state(0);

  function msg(err: unknown): string {
    if (err instanceof Error) return err.message;
    return 'Не удалось загрузить данные';
  }

  async function pull(url: string): Promise<void> {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Не удалось загрузить данные');

    const data = (await res.json()) as ExplorerPayload;
    settlements = data.settlements;
    comparisons = data.comparisons;
    stats = data.stats;

    window.dispatchEvent(new CustomEvent('explorer:ready'));
  }

  let run = $derived.by(async () => {
    tryid;
    if (ready) return;
    if (!dataUrl) throw new Error('Не указан источник данных');
    await pull(dataUrl);
  });

  // Find Shelkovo (baseline) for distance calculations
  const shelkovo = $derived(settlements.find((s) => s.is_baseline));

  // Calculate distance from Shelkovo for a settlement
  function getDistanceFromShelkovo(settlement: ExplorerSettlement): number {
    const baseline = shelkovo;
    if (!baseline || settlement.is_baseline) return 0;
    return calculateDistance(
      baseline.location.lat,
      baseline.location.lng,
      settlement.location.lat,
      settlement.location.lng,
    );
  }

  function getDistanceFromMkad(settlement: ExplorerSettlement): number {
    return getRing(settlement.location.lat, settlement.location.lng);
  }

  // Filter and sort state
  let sortBy = $state<
    | 'tariff_asc'
    | 'tariff_desc'
    | 'rating_desc'
    | 'rating_asc'
    | 'mkad'
    | 'distance'
    | 'name'
  >('rating_desc');
  let priceFilter = $state<'all' | 'cheaper' | 'more_expensive'>('all');
  let showMap = $state(false);
  let mobile = $state(false);

  // Derived: filtered and sorted settlements
  let filteredSettlements = $derived.by(() => {
    let result = [...settlements];

    // Apply price filter
    if (priceFilter !== 'all') {
      result = result.filter((s) => {
        const comparison = comparisons[s.slug];
        if (!comparison) return true;
        if (priceFilter === 'cheaper') return comparison.isCheaper;
        if (priceFilter === 'more_expensive')
          return (
            !comparison.isCheaper &&
            comparison.tariffDelta !== 0 &&
            !s.is_baseline
          );
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'rating_desc': {
          const diff = b.rating - a.rating;
          if (diff !== 0) return diff;
          return a.short_name.localeCompare(b.short_name, 'ru');
        }
        case 'rating_asc': {
          const diff = a.rating - b.rating;
          if (diff !== 0) return diff;
          return a.short_name.localeCompare(b.short_name, 'ru');
        }
        case 'tariff_asc':
          return (
            a.tariff.normalized_per_sotka_month -
            b.tariff.normalized_per_sotka_month
          );
        case 'tariff_desc':
          return (
            b.tariff.normalized_per_sotka_month -
            a.tariff.normalized_per_sotka_month
          );
        case 'mkad':
          return getDistanceFromMkad(a) - getDistanceFromMkad(b);
        case 'distance':
          return getDistanceFromShelkovo(a) - getDistanceFromShelkovo(b);
        case 'name':
          return a.short_name.localeCompare(b.short_name, 'ru');
        default:
          return 0;
      }
    });

    return result;
  });

  let displayedSettlements = $derived(filteredSettlements);
  let totalCount = $derived(settlements.length);
  let displayedCount = $derived(displayedSettlements.length);
  let compact = $derived(priceFilter !== 'all' || sortBy !== 'rating_desc');
  let help = $derived(sortBy === 'rating_desc' || sortBy === 'rating_asc');
  let mapSettlements = $derived.by(() =>
    displayedSettlements.map((s) => {
      const company = s.management_company;

      return {
        slug: s.slug,
        name: s.name,
        shortName: s.short_name,
        lat: s.location.lat,
        lng: s.location.lng,
        normalizedTariff: s.tariff.normalized_per_sotka_month,
        isBaseline: s.is_baseline,
        tariffText: formatTariffAuto(s.tariff),
        tariffHint: getTariffHint(s.tariff),
        companyText: typeof company === 'string' ? company : company?.title,
      };
    }),
  );
  let ranks = $derived(rankSettlements(settlements));
  let levels = $derived(Math.max(new Set(ranks.values()).size, 1));

  onMount(() => {
    const media = window.matchMedia('(max-width: 767px)');
    mobile = media.matches;
    showMap = !mobile;

    if (ready) {
      window.dispatchEvent(new CustomEvent('explorer:ready'));
    }
  });
</script>

<svelte:boundary>
  <span class="sr-only" aria-hidden="true">{await run}</span>

  <div class="space-y-6">
    <div class="ui-shell p-4 md:p-6">
      <div class="flex flex-col gap-5">
        <div class="flex items-start justify-between gap-2 md:items-center">
          <div
            class="flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pr-1"
          >
            <span
              class="mr-1 whitespace-nowrap text-sm font-semibold text-foreground"
              >Фильтр:</span
            >
            <input
              id={allid}
              type="radio"
              name={`${uid}-price`}
              value="all"
              bind:group={priceFilter}
              class="sr-only"
              data-testid="price-all"
            />
            <label
              for={allid}
              class="ui-btn ui-btn-sm ui-btn-outline {priceFilter === 'all'
                ? 'ui-btn-soft ui-btn-primary'
                : ''}"
            >
              Все
            </label>
            <input
              id={cheapid}
              type="radio"
              name={`${uid}-price`}
              value="cheaper"
              bind:group={priceFilter}
              class="sr-only"
              data-testid="price-cheaper"
            />
            <label
              for={cheapid}
              class="ui-btn ui-btn-sm ui-btn-outline {priceFilter === 'cheaper'
                ? 'ui-btn-soft ui-btn-success'
                : ''}"
            >
              {mobile ? 'Дешевле' : 'Дешевле Шелково'}
              {#if stats}
                <span
                  class="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-white/50 px-1.5 py-0.5 text-[11px] font-semibold text-[color:var(--color-success-text)]/80 opacity-60 backdrop-blur-[2px]"
                  aria-hidden="true"
                  data-testid="price-cheaper-count"
                >
                  {stats.cheaperCount}
                </span>
              {/if}
            </label>
            <input
              id={moreid}
              type="radio"
              name={`${uid}-price`}
              value="more_expensive"
              bind:group={priceFilter}
              class="sr-only"
              data-testid="price-more"
            />
            <label
              for={moreid}
              class="ui-btn ui-btn-sm ui-btn-outline {priceFilter ===
              'more_expensive'
                ? 'ui-btn-soft ui-btn-warning'
                : ''}"
            >
              {mobile ? 'Дороже' : 'Дороже Шелково'}
              {#if stats}
                <span
                  class="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-white/50 px-1.5 py-0.5 text-[11px] font-semibold text-[color:var(--color-danger-text)]/80 opacity-60 backdrop-blur-[2px]"
                  aria-hidden="true"
                  data-testid="price-more-count"
                >
                  {stats.moreExpensiveCount}
                </span>
              {/if}
            </label>
          </div>
          <button
            type="button"
            class="ui-btn ui-btn-sm ui-btn-outline h-8 w-8 shrink-0 p-0 md:h-auto md:w-auto md:px-3 md:py-1.5 {showMap
              ? 'ui-btn-solid ui-btn-primary'
              : ''}"
            onclick={() => {
              showMap = !showMap;
            }}
            aria-label={showMap ? 'Скрыть карту' : 'Показать карту'}
            aria-expanded={showMap}
            aria-controls={showMap ? mapid : undefined}
            data-testid="map-toggle"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-5 w-5 md:hidden"
              aria-hidden="true"
            >
              <path
                d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm5.8 7h-2.3A12 12 0 0 0 12.6 4a6.5 6.5 0 0 1 3.2 5Zm-5.8 7.4A10.5 10.5 0 0 1 8.6 11h2.8A10.5 10.5 0 0 1 10 16.4Zm-1.7 0A8.9 8.9 0 0 1 7 11h2.1a8.9 8.9 0 0 0 1.2 5.4 6.2 6.2 0 0 1-2 0Zm-3-7.4A6.5 6.5 0 0 1 8.5 4 12 12 0 0 0 7.6 9H5.3Zm0 2h2.3a12 12 0 0 0 .9 5 6.5 6.5 0 0 1-3.2-5Zm4.7-2A10.5 10.5 0 0 1 10 3.6 10.5 10.5 0 0 1 11.4 9H8.6Zm2.9 2H15a6.5 6.5 0 0 1-3.2 5 12 12 0 0 0 .9-5Z"
              />
            </svg>
            <span class="hidden md:inline"
              >{showMap ? 'Скрыть карту' : 'Показать карту'}</span
            >
          </button>
        </div>
      </div>
    </div>

    {#if showMap}
      <section id={mapid} class="space-y-4" data-testid="filtered-map">
        <SettlementMap settlements={mapSettlements} />
      </section>
    {/if}

    <div class="flex items-center justify-between gap-3">
      <p
        class="min-w-0 text-sm text-muted-foreground"
        data-testid="displayed-count"
      >
        Показано <span class="font-semibold text-foreground"
          >{displayedCount}</span
        >
        из
        <span class="font-semibold text-foreground">{totalCount}</span>
        {#if compact}
          <span class="ui-pill ui-pill-muted ml-2">активные фильтры</span>
        {/if}
      </p>
      <div class="flex shrink-0 items-center gap-3">
        <label
          for={sortid}
          class="hidden whitespace-nowrap text-sm font-semibold text-foreground sm:inline"
        >
          Сортировка:
        </label>
        <div class="flex items-center gap-2">
          <select
            id={sortid}
            value={sortBy}
            aria-label="Сортировка поселков"
            onchange={(e) => {
              sortBy = (e.currentTarget as HTMLSelectElement)
                .value as typeof sortBy;
            }}
            class="block w-auto rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
            data-testid="sort-select"
          >
            <option value="rating_desc">Условный уровень (↓)</option>
            <option value="rating_asc">Условный уровень (↑)</option>
            <option value="tariff_asc">По тарифу (↑)</option>
            <option value="tariff_desc">По тарифу (↓)</option>
            <option value="mkad">По расстоянию до МКАД</option>
            <option value="distance">По расстоянию до Шелково</option>
            <option value="name">По названию</option>
          </select>

          <span class="inline-flex h-5 w-5 items-center justify-center">
            {#if help}
              <Link
                href="/rating/"
                class="inline-flex h-5 w-5 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
                aria-label="Как считается условный уровень"
                title="Как считается условный уровень"
                data-testid="rating-help-link"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  class="h-4 w-4"
                  stroke="currentColor"
                  stroke-width="1.6"
                  aria-hidden="true"
                >
                  <circle cx="10" cy="10" r="7.25"></circle>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8.7 7.6A1.8 1.8 0 0 1 10.2 7c1 0 1.8.7 1.8 1.7 0 .8-.4 1.2-1.1 1.7-.7.4-1 .8-1 1.6"
                  ></path>
                  <circle
                    cx="10"
                    cy="13.9"
                    r="0.7"
                    fill="currentColor"
                    stroke="none"
                  ></circle>
                </svg>
              </Link>
            {/if}
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each displayedSettlements as settlement (settlement.slug)}
        <SettlementCard
          {settlement}
          comparison={comparisons[settlement.slug]}
          rank={ranks.get(settlement.slug) ?? levels}
          base={stats?.shelkovoRank ?? 1}
          total={levels}
          isBaseline={settlement.is_baseline}
        />
      {/each}
    </div>

    {#if ready && displayedCount === 0}
      <div class="ui-shell p-10 text-center">
        <p class="text-lg font-semibold text-foreground">Ничего не найдено</p>
        <p class="mt-2 text-sm text-muted-foreground">
          Попробуйте изменить фильтры
        </p>
      </div>
    {/if}
  </div>

  {#snippet failed(err, reset)}
    <div
      class="ui-shell space-y-3 p-6 text-center"
      data-testid="explorer-error"
    >
      <p class="text-base font-semibold text-foreground">{msg(err)}</p>
      <p class="text-sm text-muted-foreground">
        Показана статическая версия списка ниже.
      </p>
      <div>
        <button
          type="button"
          class="ui-btn ui-btn-sm ui-btn-outline"
          onclick={() => {
            tryid += 1;
            reset();
          }}
        >
          Повторить
        </button>
      </div>
    </div>
  {/snippet}
</svelte:boundary>
