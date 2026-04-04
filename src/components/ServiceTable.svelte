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
    partial: '◐',
    unknown: '?'
  };

  // Status colors for badges
  const colors: Record<AvailabilityStatus, string> = {
    yes: 'bg-green-100 text-green-700 border-green-200',
    no: 'bg-red-100 text-red-700 border-red-200',
    partial: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    unknown: 'bg-gray-100 text-gray-500 border-gray-200'
  };

  // Get status text
  const statusText: Record<AvailabilityStatus, string> = {
    yes: 'Есть',
    no: 'Нет',
    partial: 'Частично',
    unknown: 'Неизвестно'
  };

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
  <table class="w-full border-collapse text-left">
    <thead>
      <tr class="border-b border-slate-200 bg-slate-50">
        <th class="px-4 py-3 text-sm font-semibold text-slate-600">Услуга</th>
        <th class="px-4 py-3 text-center text-sm font-semibold text-slate-600">Статус</th>
        {#if shelkovoServices}
          <th class="px-4 py-3 text-center text-sm font-semibold text-slate-600">Шелково</th>
          <th class="w-16 px-4 py-3 text-center text-sm font-semibold text-slate-600"></th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each serviceOrder as key (key)}
        {@const value = services[key as keyof ServiceModel]}
        {@const shelkovoValue = shelkovoServices?.[key as keyof ServiceModel]}
        {@const isDifferent = hasDifference(key)}
        <tr data-testid="service-row" class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
          <td class="px-4 py-3 text-sm text-slate-900">
            {labels[key] || key}
          </td>
          <td class="px-4 py-3 text-center">
            <span 
              data-testid="service-status"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border {colors[value]}"
            >
              <span class="w-4 h-4 flex items-center justify-center">{icons[value]}</span>
              <span class="hidden sm:inline">{statusText[value]}</span>
            </span>
          </td>
          {#if shelkovoServices && shelkovoValue}
            <td class="px-4 py-3 text-center">
              <span 
                data-testid="shelkovo-service-status"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border {colors[shelkovoValue]}"
              >
                <span class="w-4 h-4 flex items-center justify-center">{icons[shelkovoValue]}</span>
                <span class="hidden sm:inline">{statusText[shelkovoValue]}</span>
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              {#if isDifferent}
                <span 
                  data-testid="diff-indicator"
                  class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold"
                  title="Отличается от Шелково"
                >
                  ≠
                </span>
              {:else}
                <span 
                  class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs font-bold"
                  title="Совпадает с Шелково"
                >
                  =
                </span>
              {/if}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
