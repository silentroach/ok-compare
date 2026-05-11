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
  class={embed
    ? 'max-w-3xl border-y border-border py-3 lg:border-y-0 lg:py-0'
    : 'ui-shell p-4 md:p-5'}
  data-testid="kpi-stats"
>
  {#if !embed}
    <div class="mb-3 flex items-end justify-between gap-3">
      <h2
        class="font-body text-sm font-semibold uppercase tracking-wide ui-muted"
        data-testid="kpi-stats-title"
      >
        Ключевые показатели
      </h2>
      <p class="text-xs ui-muted">по текущему набору поселков</p>
    </div>
  {/if}

  <div
    class={embed
      ? 'grid grid-cols-1 sm:grid-cols-2'
      : 'grid grid-cols-1 border-y border-border sm:grid-cols-2'}
  >
    <article
      class={embed ? 'sm:pr-4' : 'py-4 sm:pr-4'}
      data-testid="kpi-median"
    >
      <div
        class={embed
          ? 'mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground'
          : 'mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground'}
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
        ? 'mt-3 border-t border-border pt-3 sm:mt-0 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0'
        : 'border-t border-border py-4 sm:border-l sm:border-t-0 sm:pl-4'}
      data-testid="kpi-all-median"
    >
      <div
        class={embed
          ? 'mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] ui-muted'
          : 'mb-2 text-xs font-semibold uppercase tracking-[0.06em] ui-muted'}
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
