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
    official: 'bg-green-100 text-green-800',
    community: 'bg-blue-100 text-blue-800',
    media: 'bg-purple-100 text-purple-800',
    personal: 'bg-gray-100 text-gray-800'
  };
</script>

<div data-testid="sources-list" class="space-y-3">
  {#each sources as source}
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <a 
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:text-blue-800 font-medium truncate"
            data-testid="source-link"
          >
            {source.title}
          </a>
          <span class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeColors[source.type]}`}>
            {typeLabels[source.type]}
          </span>
        </div>
        {#if source.comment}
          <p class="text-sm text-gray-600 mt-1">{source.comment}</p>
        {/if}
      </div>
      <div class="mt-2 sm:mt-0 sm:ml-4 text-sm text-gray-500 whitespace-nowrap">
        {formatDate(source.date_checked)}
      </div>
    </div>
  {/each}
</div>
