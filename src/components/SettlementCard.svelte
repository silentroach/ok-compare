<script lang="ts">
  import type { Settlement, ComparisonResult } from '../lib/schema';
  import { formatTariff } from '../lib/format';
  import ComparisonBadge from './ComparisonBadge.svelte';
  import TariffBar from './TariffBar.svelte';
  import Link from './Link.svelte';

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
        <Link href={`settlements/${settlement.slug}/`} class="hover:text-blue-600">
          {settlement.short_name}
        </Link>
      </h3>
      <div class="flex items-center gap-2">
        {#if settlement.website}
          <a
            href={settlement.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Открыть сайт поселка"
            class="text-gray-400 hover:text-blue-600 transition-colors"
            title="Перейти на сайт поселка"
            data-testid="website-link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </a>
        {/if}
        <a
          href={`https://yandex.ru/maps/?pt=${settlement.location.lng},${settlement.location.lat}&z=15&l=map`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Открыть поселок на Яндекс.Картах"
          class="text-gray-400 hover:text-blue-600 transition-colors"
          title="Открыть на Яндекс.Картах"
          data-testid="map-link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </a>
        {#if isBaseline}
          <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
            Наш
          </span>
        {/if}
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-gray-600">Тариф:</span>
        <span class="text-lg font-semibold text-gray-900">
          {formatTariff(settlement.tariff.normalized_per_sotka_month)}
        </span>
      </div>

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

      <TariffBar
        value={settlement.tariff.normalized_per_sotka_month}
        maxValue={maxTariff}
        shelkovoValue={comparison?.tariffDelta ? settlement.tariff.normalized_per_sotka_month + comparison.tariffDelta : settlement.tariff.normalized_per_sotka_month}
      />

      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">Район:</span>
        <span class="text-gray-700">{settlement.location.district}</span>
      </div>

    </div>
  </div>

  <div class="px-6 py-3 bg-gray-50 border-t border-gray-200">
    <Link
      href={`settlements/${settlement.slug}/`}
      class="text-blue-600 hover:text-blue-800 text-sm font-medium"
    >
      Подробнее →
    </Link>
  </div>
</article>
