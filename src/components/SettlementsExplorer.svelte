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
    showMap = !window.matchMedia('(max-width: 767px)').matches;

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
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <span class="mr-1 text-sm font-semibold text-slate-700 whitespace-nowrap">Фильтр:</span>
          <label class="inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors {priceFilter === 'all' ? 'border-slate-700 bg-slate-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}">
            <input
              type="radio"
              name="price"
              value="all"
              bind:group={priceFilter}
              class="sr-only"
            />
            Все
          </label>
          <label class="inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors {priceFilter === 'cheaper' ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}">
            <input
              type="radio"
              name="price"
              value="cheaper"
              bind:group={priceFilter}
              class="sr-only"
            />
            Дешевле Шелково
          </label>
          <label class="inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors {priceFilter === 'more_expensive' ? 'border-amber-700 bg-amber-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'}">
            <input
              type="radio"
              name="price"
              value="more_expensive"
              bind:group={priceFilter}
              class="sr-only"
            />
            Дороже Шелково
          </label>
        </div>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        onclick={() => {
          showMap = !showMap;
        }}
        data-testid="map-toggle"
      >
        {showMap ? 'Скрыть карту' : 'Показать карту'}
      </button>
    </div>

    </div>
  </div>

  {#if showMap}
    <section class="space-y-4" data-testid="filtered-map">
      <SettlementMap settlements={mapSettlements} />
    </section>
  {/if}

  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-slate-600" data-testid="displayed-count">
      Показано <span class="font-semibold text-slate-900">{displayedCount}</span> из
      <span class="font-semibold text-slate-900">{totalCount}</span>
      {#if compact}
        <span class="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">активные фильтры</span>
      {/if}
    </p>
    <div class="flex flex-wrap items-center gap-3 sm:justify-end">
      <label for="sort" class="text-sm font-semibold text-slate-700 whitespace-nowrap">
        Сортировка:
      </label>
      <select
        id="sort"
        value={sortBy}
        onchange={(e) => {
          sortBy = (e.currentTarget as HTMLSelectElement).value as typeof sortBy;
        }}
        class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 sm:w-auto"
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
