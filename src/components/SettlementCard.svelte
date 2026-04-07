<script lang="ts">
  import type { Settlement, ComparisonResult } from '../lib/schema';
  import {
    formatTariffAuto,
    formatCurrency,
    getTariffHint,
  } from '../lib/format';
  import TariffBar from './TariffBar.svelte';
  import Link from './Link.svelte';

  interface Props {
    settlement: Settlement;
    comparison?: ComparisonResult;
    maxTariff: number;
    isBaseline: boolean;
  }

  let { settlement, comparison, maxTariff, isBaseline }: Props = $props();
</script>

<article
  data-testid="settlement-card"
  class="ui-shell overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
  <div class="p-5 md:p-6">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 class="text-xl font-semibold text-foreground">
          <Link href={`settlements/${settlement.slug}/`} class="ui-link">
            {settlement.short_name}
          </Link>
        </h3>
        <p class="mt-1 text-sm text-muted-foreground">
          {settlement.location.district}
        </p>
      </div>
      {#if isBaseline}
        <span class="ui-badge ui-badge-info">Наш</span>
      {/if}
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span
          class="text-2xl font-bold text-foreground"
          title={getTariffHint(settlement.tariff)}
        >
          {formatTariffAuto(settlement.tariff)}
        </span>
        {#if !isBaseline && comparison && comparison.tariffDelta !== 0}
          {#if comparison.isCheaper}
            <span class="text-sm font-semibold ui-delta-success">
              дешевле на {formatCurrency(Math.abs(comparison.tariffDelta))}
            </span>
          {:else}
            <span class="text-sm font-semibold ui-delta-warning">
              дороже на {formatCurrency(Math.abs(comparison.tariffDelta))}
            </span>
          {/if}
        {:else if isBaseline}
          <span class="text-sm font-medium text-muted-foreground"
            >базовый тариф</span
          >
        {/if}
      </div>

      <TariffBar
        value={settlement.tariff.normalized_per_sotka_month}
        maxValue={maxTariff}
        shelkovoValue={comparison?.tariffDelta
          ? settlement.tariff.normalized_per_sotka_month +
            comparison.tariffDelta
          : settlement.tariff.normalized_per_sotka_month}
      />
    </div>
  </div>
</article>
