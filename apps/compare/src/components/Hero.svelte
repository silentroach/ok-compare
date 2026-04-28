<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    subtitle?: string;
    children?: Snippet;
  }

  let { title, subtitle, children }: Props = $props();
</script>

<section class="ui-shell-strong overflow-hidden p-6 md:p-8">
  <div class="relative">
    <div
      class="absolute -top-10 right-0 h-28 w-28 rounded-full bg-info-soft/72 blur-2xl"
    ></div>
    <div
      class="absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-success-soft/68 blur-2xl"
    ></div>

    <h1
      class="max-w-3xl text-3xl font-bold leading-tight text-foreground md:text-4xl"
    >
      {title}
    </h1>
    <p class="mt-3 max-w-3xl text-base text-muted-foreground md:text-lg">
      {subtitle ||
        'Сравнивайте стоимость обслуживания и качество инфраструктуры по одинаковой шкале, чтобы принимать решения на данных, а не на обещаниях.'}
    </p>

    <div class="mt-4 max-w-4xl md:mt-5">
      {@render children?.()}
    </div>
  </div>
</section>
