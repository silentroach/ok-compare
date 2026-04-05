<script lang="ts">
  import type { ServiceModel, AvailabilityStatus } from '../lib/schema';

  interface Props {
    title?: string;
    services: ServiceModel;
    shelkovoServices?: ServiceModel;
  }

  let { title = '', services, shelkovoServices }: Props = $props();
  let only = $state(false);

  // Service item labels in Russian
  const labels: Record<string, string> = {
    garbage_collection: 'Вывоз мусора',
    snow_removal: 'Уборка снега',
    road_cleaning: 'Уборка дорог',
    landscaping: 'Благоустройство',
    emergency_service: 'Аварийная служба',
    dispatcher: 'Диспетчерская служба',
  };

  // Status icons
  const icons: Record<AvailabilityStatus, string> = {
    yes: '✓',
    no: '✗',
    partial: '◐',
  };

  // Status colors for badges
  const tones: Record<AvailabilityStatus, string> = {
    yes: 'ui-badge-success',
    no: 'ui-badge-danger',
    partial: 'ui-badge-warning',
  };

  // Get status text
  const statusText: Record<AvailabilityStatus, string> = {
    yes: 'Есть',
    no: 'Нет',
    partial: 'Частично',
  };

  const unknown = {
    icon: '?',
    text: 'Неизвестно',
    tone: 'ui-badge-muted',
  };

  function getDisplay(value: AvailabilityStatus | undefined): {
    icon: string;
    text: string;
    tone: string;
  } {
    if (value === undefined) return unknown;

    return {
      icon: icons[value],
      text: statusText[value],
      tone: tones[value],
    };
  }

  type Display = { icon: string; text: string; tone: string };

  // Check if there's a difference between settlement and Shelkovo
  function hasDifference(key: string): boolean {
    if (!shelkovoServices) return false;
    return (
      services[key as keyof ServiceModel] !==
      shelkovoServices[key as keyof ServiceModel]
    );
  }

  // Order of service items for display
  const serviceOrder = [
    'garbage_collection',
    'snow_removal',
    'road_cleaning',
    'landscaping',
    'emergency_service',
    'dispatcher',
  ];

  const rows = $derived(
    only && shelkovoServices
      ? serviceOrder.filter((key) => hasDifference(key))
      : serviceOrder,
  );
</script>

<div class="overflow-x-auto">
  {#if title}
    <div
      class={`mb-5 ${shelkovoServices ? 'grid grid-cols-[1fr_auto_auto_4rem] items-center' : 'flex items-center justify-between gap-4'}`}
    >
      <h2
        class={`text-xl font-semibold text-foreground ${shelkovoServices ? 'col-span-3' : ''}`}
      >
        {title}
      </h2>
      {#if shelkovoServices}
        <button
          type="button"
          data-testid="service-diff-toggle"
          aria-pressed={only}
          aria-label={only
            ? 'Показать все свойства'
            : 'Показать только отличающиеся свойства'}
          title={only
            ? 'Показать все свойства'
            : 'Показать только отличающиеся свойства'}
          class={`ui-pill justify-self-center min-h-9 px-3 py-1.5 cursor-pointer text-sm font-semibold transition hover:opacity-90 active:opacity-80 ${only ? 'ui-pill-warning' : 'ui-pill-muted'}`}
          onclick={() => (only = !only)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="h-4 w-4"
          >
            <path
              d="M3 4.75A.75.75 0 0 1 3.75 4h12.5a.75.75 0 0 1 .57 1.238L12 10.84V15a.75.75 0 0 1-.352.636l-2.5 1.563A.75.75 0 0 1 8 16.563v-5.722L3.18 5.238A.75.75 0 0 1 3 4.75Z"
            />
          </svg>
        </button>
      {/if}
    </div>
  {/if}

  {#snippet badge(display: Display, tid?: string)}
    <span data-testid={tid} class="ui-badge {display.tone}">
      <span class="flex h-4 w-4 items-center justify-center"
        >{display.icon}</span
      >
      <span class="hidden sm:inline">{display.text}</span>
    </span>
  {/snippet}

  {#snippet diff(diff: boolean)}
    {#if diff}
      <span
        data-testid="diff-indicator"
        class="ui-pill ui-pill-warning h-6 w-6 p-0 text-xs font-bold"
        title="Отличается от Шелково"
      >
        ≠
      </span>
    {:else}
      <span
        class="ui-pill ui-pill-success h-6 w-6 p-0 text-xs font-bold"
        title="Совпадает с Шелково"
      >
        =
      </span>
    {/if}
  {/snippet}

  <table class="ui-table">
    <thead>
      <tr class="ui-table-head">
        <th>Услуга</th>
        <th class="text-center">Статус</th>
        {#if shelkovoServices}
          <th class="text-center">Шелково</th>
          <th class="w-16 text-center"></th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#if rows.length === 0}
        <tr class="ui-table-row">
          <td
            class="ui-table-cell text-center text-sm text-muted-foreground"
            colspan={shelkovoServices ? 4 : 2}
          >
            Отличий с Шелково не найдено
          </td>
        </tr>
      {:else}
        {#each rows as key (key)}
          {@const value = services[key as keyof ServiceModel]}
          {@const shelkovoValue = shelkovoServices?.[key as keyof ServiceModel]}
          {@const isDifferent = hasDifference(key)}
          {@const display = getDisplay(value)}
          {@const shelkovoDisplay = shelkovoServices
            ? getDisplay(shelkovoValue)
            : undefined}
          <tr data-testid="service-row" class="ui-table-row">
            <td class="ui-table-cell text-sm text-foreground">
              {labels[key] || key}
            </td>
            <td class="ui-table-cell ui-table-cell-center">
              {@render badge(display, 'service-status')}
            </td>
            {#if shelkovoServices && shelkovoDisplay}
              <td class="ui-table-cell ui-table-cell-center">
                {@render badge(shelkovoDisplay, 'shelkovo-service-status')}
              </td>
              <td class="ui-table-cell ui-table-cell-center">
                {@render diff(isDifferent)}
              </td>
            {/if}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
