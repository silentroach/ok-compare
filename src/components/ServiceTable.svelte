<script lang="ts">
  import type { ServiceModel, AvailabilityStatus } from '../lib/schema';

  interface Props {
    services: ServiceModel;
    shelkovoServices?: ServiceModel | null;
  }

  let { services, shelkovoServices = null }: Props = $props();

  // Service item labels in Russian
  const labels: Record<string, string> = {
    garbage_collection: 'Вывоз мусора',
    snow_removal: 'Уборка снега',
    road_cleaning: 'Уборка дорог',
    landscaping: 'Благоустройство',
    emergency_service: 'Аварийная служба',
    dispatcher: 'Диспетчерская служба'
  };

  // Status icons
  const icons: Record<AvailabilityStatus, string> = {
    yes: '✓',
    no: '✗',
    partial: '◐'
  };

  // Status colors for badges
  const tones: Record<AvailabilityStatus, string> = {
    yes: 'ui-badge-success',
    no: 'ui-badge-danger',
    partial: 'ui-badge-warning'
  };

  // Get status text
  const statusText: Record<AvailabilityStatus, string> = {
    yes: 'Есть',
    no: 'Нет',
    partial: 'Частично'
  };

  const unknown = {
    icon: '?',
    text: 'Неизвестно',
    tone: 'ui-badge-muted'
  };

  function getDisplay(value: AvailabilityStatus | undefined): { icon: string; text: string; tone: string } {
    if (value === undefined) return unknown;

    return {
      icon: icons[value],
      text: statusText[value],
      tone: tones[value]
    };
  }

  type Display = { icon: string; text: string; tone: string };

  // Check if there's a difference between settlement and Shelkovo
  function hasDifference(key: string): boolean {
    if (!shelkovoServices) return false;
    return services[key as keyof ServiceModel] !== shelkovoServices[key as keyof ServiceModel];
  }

  // Order of service items for display
  const serviceOrder = [
    'garbage_collection',
    'snow_removal',
    'road_cleaning',
    'landscaping',
    'emergency_service',
    'dispatcher'
  ];
</script>

<div class="overflow-x-auto">
  {#snippet badge(display: Display, tid?: string)}
    <span
      data-testid={tid}
      class="ui-badge {display.tone}"
    >
      <span class="flex h-4 w-4 items-center justify-center">{display.icon}</span>
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
      {#each serviceOrder as key (key)}
        {@const value = services[key as keyof ServiceModel]}
        {@const shelkovoValue = shelkovoServices?.[key as keyof ServiceModel]}
        {@const isDifferent = hasDifference(key)}
        {@const display = getDisplay(value)}
        {@const shelkovoDisplay = shelkovoServices ? getDisplay(shelkovoValue) : null}
        <tr data-testid="service-row" class="ui-table-row">
          <td class="ui-table-cell text-sm text-slate-900">
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
    </tbody>
  </table>
</div>
