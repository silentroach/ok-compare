<script lang="ts">
  import type { Source } from '../lib/schema';
  import { formatDate } from '../lib/format';

  interface Props {
    sources: Source[];
  }

  let { sources }: Props = $props();

  const typeLabels: Record<string, string> = {
    official: 'Официальный',
    community: 'Сообщество',
    media: 'СМИ',
    personal: 'Личное'
  };

  const typeColors: Record<string, string> = {
    official: 'ui-badge ui-badge-success',
    community: 'ui-badge ui-badge-info',
    media: 'ui-badge ui-badge-warning',
    personal: 'ui-badge ui-badge-muted'
  };
</script>

<div data-testid="sources-list" class="space-y-3">
  {#each sources as source}
    <div class="flex flex-col rounded-xl border border-border bg-muted-soft p-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <a 
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            class="truncate font-medium text-foreground hover:text-primary"
            data-testid="source-link"
          >
            {source.title}
          </a>
          <span class={typeColors[source.type]}>
            {typeLabels[source.type]}
          </span>
        </div>
        {#if source.comment}
          <p class="mt-1 text-sm text-muted-foreground">{source.comment}</p>
        {/if}
      </div>
      <div class="mt-2 whitespace-nowrap text-sm text-muted-foreground sm:ml-4 sm:mt-0">
        {formatDate(source.date_checked)}
      </div>
    </div>
  {/each}
</div>
