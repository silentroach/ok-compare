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
