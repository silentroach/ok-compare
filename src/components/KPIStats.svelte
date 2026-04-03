<script lang="ts">
  import type { Stats } from '../lib/schema';
  import { formatCurrency, formatPercentage } from '../lib/format';

  interface Props {
    stats: Stats;
  }

  let { stats }: Props = $props();

  function getRankSuffix(rank: number): string {
    if (rank === 1) return 'й';
    if (rank === 2) return 'й';
    if (rank === 3) return 'й';
    if (rank >= 4 && rank <= 20) return 'й';
    const lastDigit = rank % 10;
    if (lastDigit === 1) return 'й';
    if (lastDigit >= 2 && lastDigit <= 4) return 'й';
    return 'й';
  }

  function getOrdinalRank(rank: number): string {
    return `${rank}-${getRankSuffix(rank)}`;
  }
</script>

<section class="mb-12">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="text-3xl font-bold text-blue-600 mb-2">
        {getOrdinalRank(stats.shelkovoRank)}
      </div>
      <div class="text-sm text-gray-600">
        Шелково — {stats.shelkovoRank}-й по стоимости из {stats.totalSettlements} поселков
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="text-3xl font-bold {stats.shelkovoVsMedianPercent > 0 ? 'text-red-600' : 'text-green-600'} mb-2">
        {formatPercentage(stats.shelkovoVsMedianPercent / 100)}
      </div>
      <div class="text-sm text-gray-600">
        {#if stats.shelkovoVsMedianPercent > 0}
          дороже медианы
        {:else if stats.shelkovoVsMedianPercent < 0}
          дешевле медианы
        {:else}
          совпадает с медианой
        {/if}
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="text-3xl font-bold text-green-600 mb-2">
        {stats.cheaperCount}
      </div>
      <div class="text-sm text-gray-600">
        поселков дешевле Шелково
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="text-3xl font-bold text-red-600 mb-2">
        {stats.moreExpensiveCount}
      </div>
      <div class="text-sm text-gray-600">
        поселков дороже Шелково
      </div>
    </div>
  </div>
</section>
