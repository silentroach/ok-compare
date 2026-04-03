<script lang="ts">
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
  <div data-testid="comparison-badge" class="flex items-center justify-between">
    <span class="text-gray-600">Разница:</span>
    {#if isBaseline}
      <span class="text-sm font-medium text-gray-600">Наш</span>
    {:else if isCheaper}
      <span class="text-sm font-medium text-green">
        −{Math.abs(delta)} ₽
        <span class="text-xs">(дешевле на {Math.abs(deltaPercent)}%)</span>
      </span>
    {:else}
      <span class="text-sm font-medium text-red">
        +{Math.abs(delta)} ₽
        <span class="text-xs">(дороже на {Math.abs(deltaPercent)}%)</span>
      </span>
    {/if}
  </div>
{/if}
