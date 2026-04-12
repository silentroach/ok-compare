<script lang="ts">
  import type { Stats } from '../lib/schema';
  import { formatPercentage, formatTariff } from '../lib/format';

  interface Props {
    stats: Stats;
    embed?: boolean;
  }

  let { stats, embed = false }: Props = $props();
  const plural = new Intl.PluralRules('ru-RU');

  function getMedianText(diff: number): string {
    if (diff === 0) return 'Шелково = медиане';
    return `Шелково: ${formatPercentage(diff / 100)} к медиане`;
  }

  function getMedianTone(diff: number): string {
    if (diff > 0) return 'text-[color:var(--color-danger-text)]';
    if (diff < 0) return 'text-[color:var(--color-success-text)]';
    return 'text-[color:var(--color-muted-foreground)]';
  }

  function getNoun(n: number): string {
    const kind = plural.select(Math.abs(n));
    if (kind === 'one') return 'поселок';
    if (kind === 'few') return 'поселка';
    return 'поселков';
  }

  function getCheaperText(n: number): string {
    return `${getNoun(n)} дешевле Шелково`;
  }

  function getExpensiveText(n: number): string {
    return `${getNoun(n)} дороже Шелково`;
  }

  function getShare(n: number, total: number): string {
    const rest = Math.max(total - 1, 0);
    if (rest === 0) return 'нет других поселков';
    return `${Math.round((n / rest) * 100)}% остальных поселков`;
  }
</script>

<section class={embed ? 'p-1' : 'ui-shell p-4 md:p-5'} data-testid="kpi-stats">
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
      ? 'grid grid-cols-1 gap-2 sm:grid-cols-3'
      : 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'}
  >
    <article
      class={embed
        ? 'mx-auto w-[96%] rounded-2xl bg-white/45 px-3.5 py-2.5 backdrop-blur-[3px] shadow-[0_8px_24px_-18px_rgba(15,23,42,0.6)] dark:bg-white/10'
        : 'rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-muted-soft)] p-4'}
      data-testid="kpi-median"
    >
      <div
        class={embed
          ? 'mb-0.5 text-lg font-semibold text-foreground'
          : 'mb-1 text-2xl font-semibold text-foreground'}
      >
        {formatTariff(stats.medianTariff)}
      </div>
      <div class={embed ? 'text-xs ui-muted' : 'text-sm ui-muted'}>
        медиана по поселкам
      </div>
      <div
        class={`${embed ? 'mt-1 text-xs' : 'mt-1.5 text-sm'} ${getMedianTone(stats.shelkovoVsMedianPercent)}`}
      >
        {getMedianText(stats.shelkovoVsMedianPercent)}
      </div>
    </article>

    <article
      class={embed
        ? 'mx-auto w-[96%] rounded-2xl bg-white/45 px-3.5 py-2.5 backdrop-blur-[3px] shadow-[0_8px_24px_-18px_rgba(15,23,42,0.6)] dark:bg-white/10'
        : 'rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-muted-soft)] p-4'}
      data-testid="kpi-cheaper"
    >
      <div
        class={embed
          ? 'mb-0.5 text-lg font-semibold text-[color:var(--color-success-text)]'
          : 'mb-1 text-2xl font-semibold text-[color:var(--color-success-text)]'}
      >
        {stats.cheaperCount}
      </div>
      <div class={embed ? 'text-xs ui-muted' : 'text-sm ui-muted'}>
        {getCheaperText(stats.cheaperCount)}
      </div>
      <div
        class={embed
          ? 'mt-1 text-xs text-[color:var(--color-success-text)]'
          : 'mt-1.5 text-sm text-[color:var(--color-success-text)]'}
      >
        {getShare(stats.cheaperCount, stats.totalSettlements)}
      </div>
    </article>

    <article
      class={embed
        ? 'mx-auto w-[96%] rounded-2xl bg-white/45 px-3.5 py-2.5 backdrop-blur-[3px] shadow-[0_8px_24px_-18px_rgba(15,23,42,0.6)] dark:bg-white/10'
        : 'rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-muted-soft)] p-4'}
      data-testid="kpi-expensive"
    >
      <div
        class={embed
          ? 'mb-0.5 text-lg font-semibold text-[color:var(--color-danger-text)]'
          : 'mb-1 text-2xl font-semibold text-[color:var(--color-danger-text)]'}
      >
        {stats.moreExpensiveCount}
      </div>
      <div class={embed ? 'text-xs ui-muted' : 'text-sm ui-muted'}>
        {getExpensiveText(stats.moreExpensiveCount)}
      </div>
      <div
        class={embed
          ? 'mt-1 text-xs text-[color:var(--color-danger-text)]'
          : 'mt-1.5 text-sm text-[color:var(--color-danger-text)]'}
      >
        {getShare(stats.moreExpensiveCount, stats.totalSettlements)}
      </div>
    </article>
  </div>
</section>
