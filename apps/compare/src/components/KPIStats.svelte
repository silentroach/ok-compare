<script lang="ts">
  import type { Stats } from '../lib/schema';
  import { formatPercentage, formatTariff } from '../lib/format';

  interface Props {
    stats: Stats;
    embed?: boolean;
  }

  let { stats, embed = false }: Props = $props();

  function getDeltaText(diff: number): string {
    if (diff === 0) return 'на уровне Шелково';
    return `Шелково: ${formatPercentage(diff / 100)}`;
  }

  function getMedianTone(diff: number): string {
    if (diff > 0) return 'text-danger-text';
    if (diff < 0) return 'text-success-text';
    return 'text-muted-foreground';
  }
</script>

<section
  class={embed ? 'max-w-3xl p-1' : 'ui-shell p-4 md:p-5'}
  data-testid="kpi-stats"
>
  {#if !embed}
    <div class="mb-3 flex items-end justify-between gap-3">
      <h2
        class="text-sm font-semibold uppercase tracking-wide ui-muted"
        data-testid="kpi-stats-title"
      >
        Ключевые показатели
      </h2>
      <p class="text-xs ui-muted">по текущему набору поселков</p>
    </div>
  {/if}

  <div
    class={embed
      ? 'grid grid-cols-1 gap-2 sm:grid-cols-2'
      : 'grid grid-cols-1 gap-3 sm:grid-cols-2'}
  >
    <article
      class={embed
        ? 'mx-auto w-[96%] rounded-2xl border border-border bg-[color:var(--color-surface-raised)] px-3.5 py-3 shadow-[var(--shadow-1)]'
        : 'rounded-xl border border-border bg-[color:var(--color-surface-raised)] p-4 shadow-[var(--shadow-1)]'}
      data-testid="kpi-median"
    >
      <div
        class={embed
          ? 'mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground'
          : 'mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground'}
      >
        Похожие по уровню
      </div>
      <div
        class={embed
          ? 'ui-num mb-0.5 text-lg font-semibold text-foreground'
          : 'ui-num mb-1 text-2xl font-semibold text-foreground'}
        data-testid="kpi-peer-median"
      >
        {formatTariff(stats.peerMedianTariff)}
      </div>
      <div class={embed ? 'text-xs ui-muted' : 'text-sm ui-muted'}>
        медиана тарифа
      </div>
      <div
        class={`ui-num ${embed ? 'mt-1 text-xs' : 'mt-1.5 text-sm'} ${getMedianTone(stats.shelkovoVsPeerMedianPercent)}`}
      >
        {getDeltaText(stats.shelkovoVsPeerMedianPercent)}
      </div>
    </article>

    <article
      class={embed
        ? 'mx-auto w-[96%] rounded-2xl border border-border bg-card px-3.5 py-3 shadow-[var(--shadow-1)]'
        : 'rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-1)]'}
      data-testid="kpi-all-median"
    >
      <div
        class={embed
          ? 'mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ui-muted'
          : 'mb-2 text-xs font-semibold uppercase tracking-[0.18em] ui-muted'}
      >
        Все поселки на сайте
      </div>
      <div
        class={embed
          ? 'ui-num mb-0.5 text-lg font-semibold text-foreground'
          : 'ui-num mb-1 text-2xl font-semibold text-foreground'}
      >
        {formatTariff(stats.medianTariff)}
      </div>
      <div class={embed ? 'text-xs ui-muted' : 'text-sm ui-muted'}>
        общая медиана тарифа
      </div>
      <div
        class={`ui-num ${embed ? 'mt-1 text-xs' : 'mt-1.5 text-sm'} ${getMedianTone(stats.shelkovoVsMedianPercent)}`}
      >
        {getDeltaText(stats.shelkovoVsMedianPercent)}
      </div>
    </article>
  </div>
</section>
