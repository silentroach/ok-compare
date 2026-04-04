<script lang="ts">
  import { onMount } from 'svelte';
  import type { Settlement, Stats, ComparisonResult } from '../lib/schema';
  import { calculateDistance } from '../lib/format';
  import SettlementMap from './SettlementMap.svelte';
  import SettlementCard from './SettlementCard.svelte';

  interface Props {
    settlements: Settlement[];
    comparisons: Record<string, ComparisonResult>;
    stats: Stats;
  }

  let { settlements, comparisons, stats }: Props = $props();

  // Find Shelkovo (baseline) for distance calculations
  const shelkovo = $derived.by(() => settlements.find((s) => s.is_baseline));

  // Calculate distance from Shelkovo for a settlement
  function getDistanceFromShelkovo(settlement: Settlement): number {
    const baseline = shelkovo();
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
  let infraFilters = $state({
    gas: false,
    security: false,
    roads: false,
  });
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

    // Apply infrastructure filters
    if (infraFilters.gas) {
      result = result.filter((s) => s.infrastructure.gas === 'yes');
    }
    if (infraFilters.security) {
      result = result.filter((s) => s.infrastructure.security === 'yes');
    }
    if (infraFilters.roads) {
      result = result.filter((s) => s.infrastructure.roads === 'asphalt' || s.infrastructure.roads === 'partial_asphalt');
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
  });
</script>

<div class="space-y-6">
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium text-gray-700 whitespace-nowrap">Цена:</span>
        <label class="inline-flex items-center">
          <input
            type="radio"
            name="price"
            value="all"
            bind:group={priceFilter}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span class="ml-2 text-sm text-gray-700">Все</span>
        </label>
        <label class="inline-flex items-center">
          <input
            type="radio"
            name="price"
            value="cheaper"
            bind:group={priceFilter}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span class="ml-2 text-sm text-gray-700">Дешевле Шелково</span>
        </label>
        <label class="inline-flex items-center">
          <input
            type="radio"
            name="price"
            value="more_expensive"
            bind:group={priceFilter}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span class="ml-2 text-sm text-gray-700">Дороже Шелково</span>
        </label>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium text-gray-700 whitespace-nowrap">Инфраструктура:</span>
        <label class="inline-flex items-center">
          <input
            type="checkbox"
            bind:checked={infraFilters.gas}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span class="ml-2 text-sm text-gray-700">Газ</span>
        </label>
        <label class="inline-flex items-center">
          <input
            type="checkbox"
            bind:checked={infraFilters.security}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span class="ml-2 text-sm text-gray-700">Охрана</span>
        </label>
        <label class="inline-flex items-center">
          <input
            type="checkbox"
            bind:checked={infraFilters.roads}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span class="ml-2 text-sm text-gray-700">Асфальт</span>
        </label>
      </div>

    </div>

    <div class="mt-4 flex items-center justify-end">
      <button
        type="button"
        class="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        onclick={() => {
          showMap = !showMap;
        }}
        data-testid="map-toggle"
      >
        {showMap ? 'Скрыть карту' : 'Показать карту'}
      </button>
    </div>
  </div>

  {#if showMap}
    <section class="space-y-4" data-testid="filtered-map">
      <h2 class="text-2xl font-bold text-gray-900">Карта поселков</h2>
      <SettlementMap settlements={mapSettlements} />
    </section>
  {/if}

  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-gray-600">
      Показано <span class="font-medium text-gray-900">{displayedCount}</span> из
      <span class="font-medium text-gray-900">{totalCount}</span>
    </p>
    <div class="flex flex-wrap items-center gap-3 sm:justify-end">
      <label for="sort" class="text-sm font-medium text-gray-700 whitespace-nowrap">
        Сортировка:
      </label>
      <select
        id="sort"
        bind:value={sortBy}
        class="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        <option value="tariff_asc">По тарифу (↑)</option>
        <option value="tariff_desc">По тарифу (↓)</option>
        <option value="distance">По расстоянию</option>
        <option value="name">По названию</option>
      </select>
      {#if displayedCount === 0}
        <p class="text-sm text-gray-500">Ничего не найдено</p>
      {/if}
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each displayedSettlements as settlement (settlement.slug)}
      <SettlementCard
        {settlement}
        comparison={comparisons[settlement.slug] || null}
        maxTariff={stats.maxTariff}
        isBaseline={settlement.is_baseline}
      />
    {/each}
  </div>

  {#if displayedCount === 0}
    <div class="text-center py-12 bg-gray-50 rounded-lg">
      <p class="text-gray-500 text-lg">Ничего не найдено</p>
      <p class="text-gray-400 text-sm mt-2">Попробуйте изменить фильтры</p>
    </div>
  {/if}
</div>
