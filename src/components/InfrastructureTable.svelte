<script lang="ts">
  import type { Infrastructure, AvailabilityStatus } from '../lib/schema';

  interface Props {
    infra: Infrastructure;
    shelkovoInfra?: Infrastructure | null;
  }

  let { infra, shelkovoInfra = null }: Props = $props();

  // Infrastructure item labels in Russian
  const labels: Record<string, string> = {
    roads: 'Дороги',
    sidewalks: 'Тротуары',
    lighting: 'Освещение',
    gas: 'Газ',
    water: 'Вода',
    sewage: 'Канализация',
    drainage: 'Ливневая канализация',
    checkpoints: 'КПП',
    security: 'Охрана',
    fencing: 'Ограждение',
    video_surveillance: 'Видеонаблюдение',
    playgrounds: 'Детские площадки',
    sports: 'Спортивные объекты',
    public_spaces: 'Общественные пространства',
    beach_or_water_access: 'Выход к воде',
    admin_building: 'Административное здание',
    retail_or_services: 'Магазины и услуги'
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
    if (!shelkovoInfra) return false;
    return infra[key as keyof Infrastructure] !== shelkovoInfra[key as keyof Infrastructure];
  }

  // Order of infrastructure items for display
  const infraOrder = [
    'roads', 'sidewalks', 'lighting', 'gas', 'water', 'sewage', 'drainage',
    'checkpoints', 'security', 'fencing', 'video_surveillance', 'playgrounds',
    'sports', 'public_spaces', 'beach_or_water_access', 'admin_building', 'retail_or_services'
  ];
</script>

<div class="overflow-x-auto">
  <table class="w-full text-left border-collapse">
    <thead>
      <tr class="border-b border-gray-200">
        <th class="py-3 px-4 text-sm font-medium text-gray-500">Инфраструктура</th>
        <th class="py-3 px-4 text-sm font-medium text-gray-500 text-center">Статус</th>
        {#if shelkovoInfra}
          <th class="py-3 px-4 text-sm font-medium text-gray-500 text-center">Шелково</th>
          <th class="py-3 px-4 text-sm font-medium text-gray-500 text-center w-16"></th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each infraOrder as key}
        {@const value = infra[key as keyof Infrastructure]}
        {@const shelkovoValue = shelkovoInfra?.[key as keyof Infrastructure]}
        {@const isDifferent = hasDifference(key)}
        <tr data-testid="infra-row" class="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
          <td class="py-3 px-4 text-sm text-gray-900">
            {labels[key] || key}
          </td>
          <td class="py-3 px-4 text-center">
            <span 
              data-testid="infra-status"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border {colors[value]}"
            >
              <span class="w-4 h-4 flex items-center justify-center">{icons[value]}</span>
              <span class="hidden sm:inline">{statusText[value]}</span>
            </span>
          </td>
          {#if shelkovoInfra && shelkovoValue}
            <td class="py-3 px-4 text-center">
              <span 
                data-testid="shelkovo-status"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border {colors[shelkovoValue]}"
              >
                <span class="w-4 h-4 flex items-center justify-center">{icons[shelkovoValue]}</span>
                <span class="hidden sm:inline">{statusText[shelkovoValue]}</span>
              </span>
            </td>
            <td class="py-3 px-4 text-center">
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
