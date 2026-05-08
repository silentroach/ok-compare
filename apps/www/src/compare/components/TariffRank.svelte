<script lang="ts">
  type Tone = 'info' | 'success' | 'warning';

  interface Props {
    rank: number;
    base: number;
    total: number;
    tone: Tone;
  }

  let { rank, base, total, tone }: Props = $props();

  const count = $derived(Math.max(total, 1));
  const dots = $derived.by(() =>
    Array.from({ length: count }, (_, i) => i + 1),
  );
  const current = $derived(Math.min(Math.max(rank, 1), count));
  const marker = $derived(Math.min(Math.max(base, 1), count));
  const same = $derived(current === marker);
  const note = $derived.by(() => {
    if (same) return 'Базовый поселок';
    if (tone === 'success') return 'Дешевле базового';
    if (tone === 'warning') return 'Дороже базового';
    return 'На уровне базового';
  });

  function dot(i: number): string {
    const now = i === current;
    const base = i === marker;

    if (now && base) {
      return 'h-3 w-3 rounded-full border border-card bg-info shadow-sm ring-[2px] ring-info/18';
    }

    if (now) {
      if (tone === 'success') {
        return 'h-3 w-3 rounded-full bg-success shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-success)_14%,transparent)]';
      }

      if (tone === 'warning') {
        return 'h-3 w-3 rounded-full bg-warning shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-warning)_14%,transparent)]';
      }

      return 'h-3 w-3 rounded-full bg-info shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-info)_14%,transparent)]';
    }

    if (base) {
      return 'h-2 w-2 rounded-full border border-info/60 bg-card shadow-sm';
    }

    return 'h-1.5 w-1.5 rounded-full bg-border/72';
  }
</script>

<div
  data-testid="tariff-rank"
  class="min-w-0"
  role="img"
  aria-label={`Ранг ${current} из ${count}. ${note}.`}
>
  <div
    data-testid="tariff-rank-strip"
    class="relative grid items-center gap-1.5"
    style={`grid-template-columns: repeat(${count}, minmax(0, 1fr));`}
  >
    <div
      class="pointer-events-none absolute inset-x-1.5 top-1/2 h-px -translate-y-1/2 bg-border/55"
      aria-hidden="true"
    ></div>

    {#each dots as i (i)}
      <div class="relative flex justify-center">
        <span
          data-testid={i === current
            ? 'tariff-rank-current'
            : i === marker
              ? 'tariff-rank-base'
              : undefined}
          class={dot(i)}
          aria-hidden="true"
        ></span>
      </div>
    {/each}
  </div>
</div>
