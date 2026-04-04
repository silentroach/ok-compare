<script lang="ts">
  interface Props {
    title: string;
    subtitle?: string;
  }

  let { title, subtitle }: Props = $props();
</script>

<section class="text-center pt-3 pb-6 md:pt-4 md:pb-8">
  <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
    {title}
  </h1>
  {#if subtitle}
    <p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
      {subtitle}
    </p>
  {/if}
</section>
