<script lang="ts">
  interface Props {
    title: string;
    subtitle: string;
  }

  let { title, subtitle }: Props = $props();
</script>

<section class="text-center py-12 md:py-16">
  <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
    {title}
  </h1>
  <p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
    {subtitle}
  </p>
</section>
