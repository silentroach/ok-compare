<script lang="ts">
  import { formatTariff } from '../lib/format';

  interface Props {
    value: number;
    maxValue: number;
    shelkovoValue: number;
  }

  let { value, maxValue, shelkovoValue }: Props = $props();

  // Calculate percentage (capped at 100%)
  const percentage = $derived(maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0);

  // Check if this is the baseline (Shelkovo)
  const isBaseline = $derived(value === shelkovoValue);
  const tone = $derived.by(() => {
    if (isBaseline) return 'ui-bar-info';
    if (percentage < 50) return 'ui-bar-success';
    if (percentage < 75) return 'ui-bar-warning';
    return 'ui-bar-danger';
  });
</script>

<div data-testid="tariff-bar" class="tariff-bar {isBaseline ? 'is-baseline' : ''}">
  <div class="mb-1 flex items-center justify-between text-sm">
    <span class="text-slate-500">{formatTariff(value)}</span>
    <span class="text-xs font-medium text-slate-400">{percentage.toFixed(0)}%</span>
  </div>
  <div class="ui-bar-track">
    <div
      data-testid="tariff-bar-fill"
      class="ui-bar-fill {tone}"
      style="width: {percentage}%"
    ></div>
  </div>
</div>
