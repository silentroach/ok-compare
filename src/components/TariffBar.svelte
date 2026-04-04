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
  <div class="flex items-center justify-between text-sm mb-1">
    <span class="text-gray-500">{formatTariff(value)}</span>
    <span class="text-gray-400 text-xs">{percentage.toFixed(0)}%</span>
  </div>
  <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
    <div 
      data-testid="tariff-bar-fill"
      class="h-full rounded-full transition-all duration-300 {isBaseline ? 'bg-blue-500' : percentage < 50 ? 'bg-green-500' : percentage < 75 ? 'bg-yellow-500' : 'bg-red-500'}"
      style="width: {percentage}%"
    ></div>
  </div>
</div>
