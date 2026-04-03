<script lang="ts">
  import type { Settlement, ComparisonResult } from '../lib/schema';
  import { formatTariff } from '../lib/format';
  import ComparisonBadge from './ComparisonBadge.svelte';
  import TariffBar from './TariffBar.svelte';

  interface Props {
    settlement: Settlement;
    comparison: ComparisonResult | null;
    maxTariff: number;
    isBaseline: boolean;
  }

  let { settlement, comparison, maxTariff, isBaseline }: Props = $props();
</script>

<article data-testid="settlement-card" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
  <div class="p-6">
    <div class="flex items-start justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900">
        <a href={`/compare/settlements/${settlement.slug}/`} class="hover:text-blue-600">
          {settlement.short_name}
        </a>
      </h3>
      {#if isBaseline}
        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
          Базовый
        </span>
      {/if}
    </div>
    
    <div class="space-y-3">
      <!-- Tariff display -->
      <div class="flex items-center justify-between">
        <span class="text-gray-600">Тариф:</span>
        <span class="text-lg font-semibold text-gray-900">
          {formatTariff(settlement.tariff.normalized_per_sotka_month)}
        </span>
      </div>
      
      <!-- Comparison badge -->
      {#if !isBaseline && comparison}
        <ComparisonBadge 
          delta={comparison.tariffDelta}
          deltaPercent={comparison.tariffDeltaPercent}
          isCheaper={comparison.isCheaper}
          isBaseline={false}
        />
      {:else if isBaseline}
        <ComparisonBadge 
          delta={0}
          deltaPercent={0}
          isCheaper={false}
          isBaseline={true}
        />
      {/if}
      
      <!-- Tariff bar visualization -->
      <TariffBar 
        value={settlement.tariff.normalized_per_sotka_month}
        maxValue={maxTariff}
        shelkovoValue={comparison?.tariffDelta ? settlement.tariff.normalized_per_sotka_month + comparison.tariffDelta : settlement.tariff.normalized_per_sotka_month}
      />
      
      <!-- Location info -->
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">Район:</span>
        <span class="text-gray-700">{settlement.location.district}</span>
      </div>
      
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">Направление:</span>
        <span class="text-gray-700">{settlement.location.area}</span>
      </div>
      
    </div>
  </div>
  
  <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
    <a 
      href={`/compare/settlements/${settlement.slug}/`}
      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
    >
      Подробнее →
    </a>
  </div>
</article>
