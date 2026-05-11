<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    subtitle?: string;
    subtitleLinkHref?: string;
    subtitleLinkText?: string;
    children?: Snippet;
  }

  let {
    title,
    subtitle = 'Сравнивайте стоимость обслуживания и качество инфраструктуры по одинаковой шкале, чтобы принимать решения на данных, а не на обещаниях.',
    subtitleLinkHref,
    subtitleLinkText,
    children,
  }: Props = $props();
</script>

<section
  class="border-b border-border bg-[color:var(--color-bg-soft)] py-6 md:py-8"
>
  <div
    class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:items-end"
  >
    <div>
      <h1
        class="max-w-3xl text-3xl font-bold leading-tight text-foreground md:text-4xl"
      >
        {title}
      </h1>
      <p class="mt-3 max-w-3xl text-base text-muted-foreground md:text-lg">
        {subtitle}
        {#if subtitleLinkHref && subtitleLinkText}
          <a
            href={subtitleLinkHref}
            class="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
          >
            {subtitleLinkText}
          </a>
        {/if}
      </p>
    </div>

    {#if children}
      <div class="pt-4 md:pt-5 lg:border-l lg:border-border lg:pl-6 lg:pt-0">
        {@render children()}
      </div>
    {/if}
  </div>
</section>
