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
      return 'h-3 w-3 rounded-full border-2 border-info bg-[color:var(--color-surface)]';
    }

    if (now) {
      if (tone === 'success') {
        return 'h-3 w-3 rounded-full border border-success bg-success';
      }

      if (tone === 'warning') {
        return 'h-3 w-3 rounded-full border border-warning-text bg-warning-text';
      }

      return 'h-3 w-3 rounded-full border border-info bg-info';
    }

    if (base) {
      return 'h-2.5 w-2.5 rounded-full border border-info/70 bg-[color:var(--color-surface)]';
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
