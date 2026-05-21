<script lang="ts">
  import type { Stats } from '../lib/settlement/types';
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
  class={embed ? 'max-w-3xl text-sm' : 'ui-shell p-4 md:p-5'}
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
      ? 'divide-y divide-border md:grid md:grid-cols-2 md:divide-y-0'
      : 'grid grid-cols-1 border-y border-border sm:grid-cols-2'}
  >
    <article
      class={embed
        ? 'flex items-start justify-between gap-4 py-3 md:block md:py-0 md:pr-4'
        : 'py-4 sm:pr-4'}
      data-testid="kpi-median"
    >
      <div>
        <div
          class={embed
            ? 'text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground md:mb-2'
            : 'mb-2 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground'}
        >
          Похожие по уровню
        </div>
        <div class={embed ? 'text-xs ui-muted md:text-xs' : 'text-sm ui-muted'}>
          медиана тарифа
        </div>
      </div>
      <div class={embed ? 'text-right md:text-left' : ''}>
        <div
          class={embed
            ? 'ui-num text-base font-semibold leading-tight text-foreground md:mb-0.5 md:text-lg'
            : 'ui-num mb-1 text-2xl font-semibold text-foreground'}
          data-testid="kpi-peer-median"
        >
          {formatTariff(stats.peerMedianTariff)}
        </div>
        <div
          class={`ui-num ${embed ? 'mt-1 text-xs leading-tight' : 'mt-1.5 text-sm'} ${getMedianTone(stats.shelkovoVsPeerMedianPercent)}`}
        >
          {getDeltaText(stats.shelkovoVsPeerMedianPercent)}
        </div>
      </div>
    </article>

    <article
      class={embed
        ? 'flex items-start justify-between gap-4 py-3 md:block md:border-l md:py-0 md:pl-4'
        : 'border-t border-border py-4 sm:border-l sm:border-t-0 sm:pl-4'}
      data-testid="kpi-all-median"
    >
      <div>
        <div
          class={embed
            ? 'text-[11px] font-semibold uppercase tracking-[0.06em] ui-muted md:mb-2'
            : 'mb-2 text-xs font-semibold uppercase tracking-[0.06em] ui-muted'}
        >
          Все поселки на сайте
        </div>
        <div class={embed ? 'text-xs ui-muted md:text-xs' : 'text-sm ui-muted'}>
          общая медиана тарифа
        </div>
      </div>
      <div class={embed ? 'text-right md:text-left' : ''}>
        <div
          class={embed
            ? 'ui-num text-base font-semibold leading-tight text-foreground md:mb-0.5 md:text-lg'
            : 'ui-num mb-1 text-2xl font-semibold text-foreground'}
        >
          {formatTariff(stats.medianTariff)}
        </div>
        <div
          class={`ui-num ${embed ? 'mt-1 text-xs leading-tight' : 'mt-1.5 text-sm'} ${getMedianTone(stats.shelkovoVsMedianPercent)}`}
        >
          {getDeltaText(stats.shelkovoVsMedianPercent)}
        </div>
      </div>
    </article>
  </div>
</section>
