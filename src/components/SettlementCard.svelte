<script lang="ts">
  import Link from '@shelkovo/ui/Link.svelte';
  import type { ExplorerSettlement } from '../lib/explorer';
  import type { ComparisonResult } from '../lib/schema';
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
  class="ui-shell overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
>
  <div class="p-5 md:p-6">
    <div class="mb-4 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="text-xl font-semibold text-foreground">
          <Link href={`settlements/${settlement.slug}/`} class="ui-link">
            {settlement.short_name}
          </Link>
        </h3>
        <p class="mt-1 text-sm text-muted-foreground">
          {settlement.location.district}
        </p>
      </div>
      <div class="shrink-0 flex items-center justify-end gap-1.5 text-right">
        {#if settlement.rabstvo}
          <a
            href="https://t.me/obmandachniki"
            target="_blank"
            rel="noopener noreferrer"
            class="ui-badge border-danger bg-danger px-2 py-1 text-[11px] text-danger-foreground transition-opacity hover:opacity-90"
            title="Открыть канал Коттеджное рабство"
            data-testid="rabstvo-badge"
          >
            рабство
          </a>
        {/if}
        {#if isBaseline}
          <span class="ui-badge ui-badge-info px-2 py-1 text-[11px] opacity-75">
            наш
          </span>
        {/if}
        <p
          class="ui-num text-sm font-medium text-muted-foreground/50"
          data-testid="tariff-rank-label"
          title="Ранг по возрастанию тарифа (1 — самый дешевый)"
        >
          {rank} / {total}
        </p>
      </div>
    </div>

    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <span
          class="ui-num text-2xl font-bold text-foreground"
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
  </div>
</article>
