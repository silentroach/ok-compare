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
</script>

<div data-testid="tariff-bar" class="tariff-bar {isBaseline ? 'is-baseline' : ''}">
  <div class="mb-1 flex items-center justify-between text-sm">
    <span class="text-slate-500">{formatTariff(value)}</span>
    <span class="text-xs font-medium text-slate-400">{percentage.toFixed(0)}%</span>
  </div>
  <div class="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
    <div 
      data-testid="tariff-bar-fill"
      class="h-full rounded-full transition-all duration-300 {isBaseline ? 'bg-sky-600' : percentage < 50 ? 'bg-emerald-600' : percentage < 75 ? 'bg-amber-500' : 'bg-rose-600'}"
      style="width: {percentage}%"
    ></div>
  </div>
</div>
