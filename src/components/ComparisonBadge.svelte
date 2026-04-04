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
      <span class="ui-badge ui-badge-info">Наш</span>
    {:else if isCheaper}
      <span class="text-sm font-semibold ui-delta-success">
        −{formatCurrency(Math.abs(delta))}
        <span class="ui-delta-note ml-1">(дешевле на {Math.abs(deltaPercent)}%)</span>
      </span>
    {:else}
      <span class="text-sm font-semibold ui-delta-warning">
        +{formatCurrency(Math.abs(delta))}
        <span class="ui-delta-note ml-1">(дороже на {Math.abs(deltaPercent)}%)</span>
      </span>
    {/if}
  </div>
{/if}
