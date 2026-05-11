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
  class="flex min-h-full flex-col gap-3 rounded-sm border border-border bg-[color:var(--color-surface)] p-4 md:p-5"
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

  <div class="mt-auto space-y-3 pt-1">
    <div
      class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5"
    >
      <span
        class="ui-num text-2xl font-bold leading-none text-foreground"
        title={getTariffHint(settlement.tariff)}
      >
        {formatTariffAuto(settlement.tariff)}
      </span>
      {#if !isBaseline && comparison && comparison.tariffDelta !== 0}
        {#if comparison.isCheaper}
          <span class="ui-num text-sm font-semibold ui-delta-success">
            дешевле на {formatCurrency(Math.abs(comparison.tariffDelta))}
          </span>
        {:else}
          <span class="ui-num text-sm font-semibold ui-delta-warning">
            дороже на {formatCurrency(Math.abs(comparison.tariffDelta))}
          </span>
        {/if}
      {:else if isBaseline}
        <span class="text-sm font-medium text-muted-foreground"
          >базовый тариф</span
        >
      {/if}
    </div>

    <TariffRank {rank} {base} {total} {tone} />
  </div>
</article>
