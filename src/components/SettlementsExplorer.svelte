<script lang="ts">
  import { onMount } from 'svelte';
  import type { Settlement, Stats, ComparisonResult } from '../lib/schema';
  import { calculateDistance } from '../lib/format';
  import SettlementMap from './SettlementMap.svelte';
  import SettlementCard from './SettlementCard.svelte';

  interface Props {
    settlements?: Settlement[];
    comparisons?: Record<string, ComparisonResult>;
    stats?: Stats;
    dataUrl?: string;
  }

  interface Payload {
    settlements: Settlement[];
    comparisons: Record<string, ComparisonResult>;
    stats: Stats;
  }

  let {
    settlements = [],
    comparisons = {},
    stats = null,
    dataUrl = ''
  }: {
    settlements: Settlement[];
    comparisons: Record<string, ComparisonResult>;
    stats: Stats | null;
    dataUrl: string;
  } = $props();

  const uid = $props.id();
  const allid = `${uid}-price-all`;
  const cheapid = `${uid}-price-cheaper`;
  const moreid = `${uid}-price-more`;
  const sortid = `${uid}-sort`;
  const mapid = `${uid}-map`;

  let ready = $derived(settlements.length > 0 || dataUrl.length === 0);
  let err = $state('');

  // Find Shelkovo (baseline) for distance calculations
  const shelkovo = $derived(settlements.find((s) => s.is_baseline));

  // Calculate distance from Shelkovo for a settlement
  function getDistanceFromShelkovo(settlement: Settlement): number {
    const baseline = shelkovo;
    if (!baseline || settlement.is_baseline) return 0;
    return calculateDistance(
      baseline.location.lat,
      baseline.location.lng,
      settlement.location.lat,
      settlement.location.lng
    );
  }

  // Filter and sort state
  let sortBy = $state<'tariff_asc' | 'tariff_desc' | 'distance' | 'name'>('tariff_asc');
  let priceFilter = $state<'all' | 'cheaper' | 'more_expensive'>('all');
  let showMap = $state(true);
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
        if (priceFilter === 'more_expensive') return !comparison.isCheaper && !s.is_baseline;
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'tariff_asc':
          return a.tariff.normalized_per_sotka_month - b.tariff.normalized_per_sotka_month;
        case 'tariff_desc':
          return b.tariff.normalized_per_sotka_month - a.tariff.normalized_per_sotka_month;
        case 'distance':
          return getDistanceFromShelkovo(a) - getDistanceFromShelkovo(b);
        case 'name':
          return a.short_name.localeCompare(b.short_name, 'ru');
        default:
          return 0;
      }
    });

    // Pin Shelkovo to top
    const shelkovoIndex = result.findIndex((s) => s.is_baseline);
    if (shelkovoIndex > 0) {
      const shelkovo = result.splice(shelkovoIndex, 1)[0];
      result.unshift(shelkovo);
    }

    return result;
  });

  let displayedSettlements = $derived(filteredSettlements);
  let totalCount = $derived(settlements.length);
  let displayedCount = $derived(displayedSettlements.length);
  let compact = $derived(priceFilter !== 'all' || sortBy !== 'tariff_asc');
  let mapSettlements = $derived.by(() => displayedSettlements.map((s) => ({
    slug: s.slug,
    name: s.name,
    shortName: s.short_name,
    lat: s.location.lat,
    lng: s.location.lng,
    normalizedTariff: s.tariff.normalized_per_sotka_month,
    isBaseline: s.is_baseline,
  })));

  onMount(() => {
    const media = window.matchMedia('(max-width: 767px)');
    mobile = media.matches;
    showMap = !mobile;

    if (ready) {
      window.dispatchEvent(new CustomEvent('explorer:ready'));
      return;
    }

    if (!dataUrl) return;

    void fetch(dataUrl)
      .then((res) => {
        if (!res.ok) return null;
        return res.json() as Promise<Payload>;
      })
      .then((data) => {
        if (!data) {
          err = 'Не удалось загрузить данные';
          return;
        }
        settlements = data.settlements;
        comparisons = data.comparisons;
        stats = data.stats;
        window.dispatchEvent(new CustomEvent('explorer:ready'));
      })
      .catch(() => {
        err = 'Не удалось загрузить данные';
      });
  });
</script>

<div class="space-y-6">
  <div class="ui-shell p-4 md:p-6">
    <div class="flex flex-col gap-5">
      <div class="flex items-start justify-between gap-2 md:items-center">
        <div class="flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pr-1">
          <span class="mr-1 text-sm font-semibold text-slate-700 whitespace-nowrap">Фильтр:</span>
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
            class="ui-btn ui-btn-sm ui-btn-outline {priceFilter === 'all' ? 'ui-btn-soft ui-btn-primary' : ''}"
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
            class="ui-btn ui-btn-sm ui-btn-outline {priceFilter === 'cheaper' ? 'ui-btn-soft ui-btn-success' : ''}"
          >
            {mobile ? 'Дешевле' : 'Дешевле Шелково'}
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
            class="ui-btn ui-btn-sm ui-btn-outline {priceFilter === 'more_expensive' ? 'ui-btn-soft ui-btn-warning' : ''}"
          >
            {mobile ? 'Дороже' : 'Дороже Шелково'}
          </label>
        </div>
        <button
          type="button"
          class="ui-btn ui-btn-sm ui-btn-outline h-8 w-8 shrink-0 p-0 md:h-auto md:w-auto md:px-3 md:py-1.5 {showMap ? 'ui-btn-solid ui-btn-primary' : ''}"
          onclick={() => {
            showMap = !showMap;
          }}
          aria-label={showMap ? 'Скрыть карту' : 'Показать карту'}
          aria-pressed={showMap}
          aria-controls={mapid}
          data-testid="map-toggle"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 md:hidden" aria-hidden="true">
            <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm5.8 7h-2.3A12 12 0 0 0 12.6 4a6.5 6.5 0 0 1 3.2 5Zm-5.8 7.4A10.5 10.5 0 0 1 8.6 11h2.8A10.5 10.5 0 0 1 10 16.4Zm-1.7 0A8.9 8.9 0 0 1 7 11h2.1a8.9 8.9 0 0 0 1.2 5.4 6.2 6.2 0 0 1-2 0Zm-3-7.4A6.5 6.5 0 0 1 8.5 4 12 12 0 0 0 7.6 9H5.3Zm0 2h2.3a12 12 0 0 0 .9 5 6.5 6.5 0 0 1-3.2-5Zm4.7-2A10.5 10.5 0 0 1 10 3.6 10.5 10.5 0 0 1 11.4 9H8.6Zm2.9 2H15a6.5 6.5 0 0 1-3.2 5 12 12 0 0 0 .9-5Z" />
          </svg>
          <span class="hidden md:inline">{showMap ? 'Скрыть карту' : 'Показать карту'}</span>
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
    <p class="min-w-0 text-sm text-slate-600" data-testid="displayed-count">
      Показано <span class="font-semibold text-slate-900">{displayedCount}</span> из
      <span class="font-semibold text-slate-900">{totalCount}</span>
      {#if compact}
        <span class="ui-pill ui-pill-muted ml-2">активные фильтры</span>
      {/if}
    </p>
    <div class="flex shrink-0 items-center gap-3">
      <label for={sortid} class="hidden text-sm font-semibold text-slate-700 whitespace-nowrap sm:inline">
        Сортировка:
      </label>
      <select
        id={sortid}
        value={sortBy}
        onchange={(e) => {
          sortBy = (e.currentTarget as HTMLSelectElement).value as typeof sortBy;
        }}
        class="block w-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
        data-testid="sort-select"
      >
        <option value="tariff_asc">По тарифу (↑)</option>
        <option value="tariff_desc">По тарифу (↓)</option>
        <option value="distance">По расстоянию</option>
        <option value="name">По названию</option>
      </select>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each displayedSettlements as settlement (settlement.slug)}
      <SettlementCard
        {settlement}
        comparison={comparisons[settlement.slug] || null}
        maxTariff={stats?.maxTariff ?? 0}
        isBaseline={settlement.is_baseline}
      />
    {/each}
  </div>

  {#if err}
    <div class="ui-shell p-6 text-center">
      <p class="text-base font-semibold text-slate-800">{err}</p>
      <p class="mt-2 text-sm text-slate-500">Показана статическая версия списка ниже.</p>
    </div>
  {:else if ready && displayedCount === 0}
    <div class="ui-shell p-10 text-center">
      <p class="text-lg font-semibold text-slate-800">Ничего не найдено</p>
      <p class="mt-2 text-sm text-slate-500">Попробуйте изменить фильтры</p>
    </div>
  {/if}
</div>
