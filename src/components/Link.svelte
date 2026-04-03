<script lang="ts">
  import { withBase } from '../lib/url';
  import type { Snippet } from 'svelte';

  interface Props {
    href: string;
    class?: string;
    children?: Snippet;
    [key: string]: unknown;
  }

  let { href, class: className, children, ...rest }: Props = $props();

  const finalHref = $derived(withBase(href));
</script>

<a href={finalHref} class={className} {...rest}>
  {@render children?.()}
</a>
