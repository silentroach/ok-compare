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
    if (diff > 0) return 'text-[color:var(--color-danger-text)]';
    if (diff < 0) return 'text-[color:var(--color-success-text)]';
    return 'text-[color:var(--color-muted-foreground)]';
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
        ? 'mx-auto w-[96%] rounded-2xl border border-[#ebd2cc] bg-[linear-gradient(160deg,rgba(255,255,255,0.95),rgba(255,242,239,0.94))] px-3.5 py-3 shadow-[0_14px_32px_-24px_rgba(127,29,29,0.42)] backdrop-blur-[3px] dark:border-white/10 dark:bg-white/10'
        : 'rounded-xl border border-[#ebd2cc] bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(255,244,241,0.92))] p-4 shadow-[0_18px_34px_-28px_rgba(127,29,29,0.34)] dark:border-white/10 dark:bg-white/10'}
      data-testid="kpi-median"
    >
      <div
        class={embed
          ? 'mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-danger-text)]/80'
          : 'mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-danger-text)]/80'}
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
        ? 'mx-auto w-[96%] rounded-2xl border border-white/50 bg-white/50 px-3.5 py-3 backdrop-blur-[3px] shadow-[0_12px_28px_-24px_rgba(15,23,42,0.5)] dark:border-white/10 dark:bg-white/8'
        : 'rounded-xl border border-[color:var(--color-border)] bg-white/70 p-4 shadow-[0_16px_32px_-28px_rgba(15,23,42,0.3)] dark:border-white/10 dark:bg-white/8'}
      data-testid="kpi-all-median"
    >
      <div
        class={embed
          ? 'mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ui-muted'
          : 'mb-2 text-xs font-semibold uppercase tracking-[0.18em] ui-muted'}
      >
        Все поселки
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
