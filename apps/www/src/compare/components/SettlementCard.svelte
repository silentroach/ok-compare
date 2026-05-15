<script lang="ts">
  import Link from '@shelkovo/ui/Link.svelte';
  import type { ExplorerSettlement } from '../lib/explorer';
  import type { ComparisonResult } from '../lib/schema';
  import { withBase } from '../lib/url';
  import {
    formatTariffAuto,
    formatCurrency,
    getTariffHint,
  } from '../lib/format';
  import TariffRank from './TariffRank.svelte';

  interface Props {
    settlement: ExplorerSettlement;
    comparison?: ComparisonResult;
    rank: number;
    base: number;
    total: number;
    isBaseline: boolean;
  }

  let { settlement, comparison, rank, base, total, isBaseline }: Props =
    $props();

  const tone = $derived.by(() => {
    if (isBaseline || !comparison || comparison.tariffDelta === 0)
      return 'info';
    return comparison.isCheaper ? 'success' : 'warning';
  });
</script>

<article
  data-testid="settlement-card"
  class="ui-shell grid min-h-full gap-3 p-3.5 md:flex md:flex-col md:p-5"
>
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0 space-y-1">
      <h3 class="text-lg font-bold leading-tight text-foreground md:text-xl">
        <Link
          href={withBase(`settlements/${settlement.slug}/`)}
          class="ui-link"
        >
          {settlement.short_name}
        </Link>
      </h3>
      <p class="text-sm leading-snug text-muted-foreground">
        {settlement.location.district}
      </p>
    </div>
    <div
      class="flex shrink-0 flex-wrap items-center justify-end gap-1.5 text-right"
    >
      {#if settlement.rabstvo}
        <a
          href="https://t.me/obmandachniki"
          target="_blank"
          rel="noopener noreferrer"
          class="ui-badge ui-badge-danger px-2 py-1 text-[11px] transition-colors hover:border-danger hover:bg-danger hover:text-danger-foreground"
          title="Открыть канал Коттеджное рабство"
          data-testid="rabstvo-badge"
        >
          рабство
        </a>
      {/if}
      {#if isBaseline}
        <span class="ui-badge ui-badge-info px-2 py-1 text-[11px]"> наш </span>
      {/if}
      <p
        class="ui-num text-xs font-semibold text-muted-foreground"
        data-testid="tariff-rank-label"
        title="Ранг по возрастанию тарифа (1 — самый дешевый)"
      >
        {rank} / {total}
      </p>
    </div>
  </div>

  <div
    class="border-t border-border pt-3 md:mt-auto md:space-y-3 md:border-t-0 md:pt-1"
  >
    <div
      class="flex items-end justify-between gap-3 md:flex-wrap md:items-baseline md:gap-x-4 md:gap-y-1.5"
    >
      <span
        class="ui-num text-[1.65rem] font-bold leading-none text-foreground md:text-2xl"
        title={getTariffHint(settlement.tariff)}
      >
        {formatTariffAuto(settlement.tariff)}
      </span>
      {#if !isBaseline && comparison && comparison.tariffDelta !== 0}
        {#if comparison.isCheaper}
          <span
            class="ui-num max-w-[9rem] text-right text-sm font-semibold leading-tight ui-delta-success"
          >
            дешевле на {formatCurrency(Math.abs(comparison.tariffDelta))}
          </span>
        {:else}
          <span
            class="ui-num max-w-[9rem] text-right text-sm font-semibold leading-tight ui-delta-warning"
          >
            дороже на {formatCurrency(Math.abs(comparison.tariffDelta))}
          </span>
        {/if}
      {:else if isBaseline}
        <span class="text-sm font-medium text-muted-foreground"
          >базовый тариф</span
        >
      {/if}
    </div>

    <div class="hidden md:block">
      <TariffRank {rank} {base} {total} {tone} />
    </div>
  </div>
</article>
