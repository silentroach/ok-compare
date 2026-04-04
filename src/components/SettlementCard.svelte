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

<article data-testid="settlement-card" class="ui-shell overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
  <div class="p-5 md:p-6">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 class="text-xl font-semibold text-slate-900">
          <Link href={`settlements/${settlement.slug}/`} class="ui-link">
          {settlement.short_name}
        </Link>
      </h3>
        <p class="mt-1 text-sm text-slate-500">{settlement.location.district} район</p>
      </div>
      <div class="flex items-center gap-2">
        {#if settlement.website}
          <a
            href={settlement.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Открыть сайт поселка"
            class="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title="Перейти на сайт поселка"
            data-testid="website-link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </a>
        {/if}
        <a
          href={settlement.location.map_url ?? `https://yandex.ru/maps/?pt=${settlement.location.lng},${settlement.location.lat}&z=15&l=map`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Открыть поселок на Яндекс.Картах"
          class="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          title="Открыть на Яндекс.Картах"
          data-testid="map-link"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </a>
        {#if isBaseline}
          <span class="rounded-full border border-sky-200 bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
            Наш
          </span>
        {/if}
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-slate-500">Тариф</span>
        <span class="text-2xl font-bold text-slate-900">
          {formatTariff(settlement.tariff.normalized_per_sotka_month)}
        </span>
      </div>

      {#if !isBaseline}
        <ComparisonBadge
          delta={comparison?.tariffDelta ?? 0}
          deltaPercent={comparison?.tariffDeltaPercent ?? 0}
          isCheaper={comparison?.isCheaper ?? false}
          isBaseline={false}
        />
      {:else}
        <div class="h-[24px]" aria-hidden="true"></div>
      {/if}

      <TariffBar
        value={settlement.tariff.normalized_per_sotka_month}
        maxValue={maxTariff}
        shelkovoValue={comparison?.tariffDelta ? settlement.tariff.normalized_per_sotka_month + comparison.tariffDelta : settlement.tariff.normalized_per_sotka_month}
      />
    </div>
  </div>
</article>
