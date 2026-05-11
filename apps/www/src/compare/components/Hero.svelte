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
  class="border-b border-transparent bg-[color:var(--color-bg-soft)] pb-4 md:border-border md:pb-8"
>
  <div
    class="grid gap-4 md:gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:items-end"
  >
    <div>
      <h1
        class="max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-5xl md:leading-[1.08]"
      >
        {title}
      </h1>
      <p
        class="mt-2 max-w-2xl text-[1.0625rem] leading-7 text-muted-foreground md:mt-3 md:max-w-3xl md:text-lg md:leading-8"
      >
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
      <div class="pt-3 md:pt-5 lg:border-l lg:border-border lg:pl-6 lg:pt-0">
        {@render children()}
      </div>
    {/if}
  </div>
</section>
