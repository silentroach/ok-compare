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
    official: 'bg-emerald-100 text-emerald-800',
    community: 'bg-sky-100 text-sky-800',
    media: 'bg-amber-100 text-amber-800',
    personal: 'bg-slate-100 text-slate-700'
  };
</script>

<div data-testid="sources-list" class="space-y-3">
  {#each sources as source}
    <div class="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <a 
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            class="truncate font-medium text-slate-800 hover:text-slate-950"
            data-testid="source-link"
          >
            {source.title}
          </a>
          <span class={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${typeColors[source.type]}`}>
            {typeLabels[source.type]}
          </span>
        </div>
        {#if source.comment}
          <p class="mt-1 text-sm text-slate-600">{source.comment}</p>
        {/if}
      </div>
      <div class="mt-2 whitespace-nowrap text-sm text-slate-500 sm:ml-4 sm:mt-0">
        {formatDate(source.date_checked)}
      </div>
    </div>
  {/each}
</div>
