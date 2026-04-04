<script lang="ts">
  import { formatCurrency } from '../lib/format';

  interface Props {
    delta: number;
    deltaPercent: number;
    isCheaper: boolean;
    isBaseline: boolean;
  }

  let { delta, deltaPercent, isCheaper, isBaseline }: Props = $props();

  // Don't render if no delta and not baseline
  const shouldRender = $derived(isBaseline || delta !== 0);
</script>

{#if shouldRender}
  <div data-testid="comparison-badge" class="flex items-center justify-between gap-2">
    <span class="text-sm font-medium text-slate-600">Разница:</span>
    {#if isBaseline}
      <span class="rounded-full border border-sky-200 bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">Наш</span>
    {:else if isCheaper}
      <span class="text-sm font-semibold text-emerald-700">
        −{formatCurrency(Math.abs(delta))}
        <span class="ml-1 text-xs font-medium text-emerald-600">(дешевле на {Math.abs(deltaPercent)}%)</span>
      </span>
    {:else}
      <span class="text-sm font-semibold text-amber-700">
        +{formatCurrency(Math.abs(delta))}
        <span class="ml-1 text-xs font-medium text-amber-600">(дороже на {Math.abs(deltaPercent)}%)</span>
      </span>
    {/if}
  </div>
{/if}
