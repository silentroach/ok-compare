<script lang="ts">
  import type { Infrastructure, AvailabilityStatus, RoadType, DrainageType, VideoSurveillance, UndergroundElectricity } from '../lib/schema';

  interface Props {
    infra: Infrastructure;
    shelkovoInfra?: Infrastructure | null;
  }

  let { infra, shelkovoInfra = null }: Props = $props();

  // Infrastructure item labels in Russian
  const labels: Record<string, string> = {
    roads: 'Дороги',
    sidewalks: 'Тротуары',
    lighting: 'Уличное освещение',
    gas: 'Газ',
    water: 'Центральное водоснабжение',
    sewage: 'Центральная канализация',
    drainage: 'Ливневка',
    checkpoints: 'КПП',
    security: 'Охрана',
    fencing: 'Закрытая территория',
    video_surveillance: 'Видеонаблюдение',
    underground_electricity: 'Подземная электросеть',
    playgrounds: 'Детские площадки',
    sports: 'Спортивные объекты',
    public_spaces: 'Общественные пространства',
    beach_or_water_access: 'Выход к воде',
    admin_building: 'Административное здание',
    retail_or_services: 'Магазины'
  };

  // Status icons for AvailabilityStatus
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

  // Get status text for AvailabilityStatus
  const statusText: Record<AvailabilityStatus, string> = {
    yes: 'Есть',
    no: 'Нет',
    partial: 'Частично',
    unknown: 'Неизвестно'
  };

  // Road type display config
  const roadConfig: Record<RoadType, { icon: string; text: string; color: string }> = {
    asphalt: { icon: '●', text: 'Асфальт', color: 'bg-green-100 text-green-700 border-green-200' },
    partial_asphalt: { icon: '◐', text: 'Частично асфальт', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    gravel: { icon: '○', text: 'Крошка', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    dirt: { icon: '✗', text: 'Грунт', color: 'bg-red-100 text-red-700 border-red-200' }
  };

  // Drainage type display config
  const drainageConfig: Record<DrainageType, { icon: string; text: string; color: string }> = {
    closed: { icon: '✓', text: 'Закрытая', color: 'bg-green-100 text-green-700 border-green-200' },
    open: { icon: '◐', text: 'Открытая', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    none: { icon: '✗', text: 'Отсутствует', color: 'bg-red-100 text-red-700 border-red-200' }
  };

  // Video surveillance display config
  const videoConfig: Record<VideoSurveillance, { icon: string; text: string; color: string }> = {
    full: { icon: '✓', text: 'Есть', color: 'bg-green-100 text-green-700 border-green-200' },
    checkpoint_only: { icon: '◐', text: 'Только на КПП', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    none: { icon: '✗', text: 'Нет', color: 'bg-red-100 text-red-700 border-red-200' }
  };

  // Underground electricity display config
  const electricityConfig: Record<UndergroundElectricity, { icon: string; text: string; color: string }> = {
    full: { icon: '✓', text: 'Полностью', color: 'bg-green-100 text-green-700 border-green-200' },
    partial: { icon: '◐', text: 'Частично', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    none: { icon: '✗', text: 'По столбам', color: 'bg-red-100 text-red-700 border-red-200' }
  };

  // Get display config for a specific infrastructure key and value
  function getDisplayConfig(key: string, value: string | undefined): { icon: string; text: string; color: string } {
    if (value === undefined) {
      return { icon: '?', text: 'Неизвестно', color: 'bg-gray-100 text-gray-500 border-gray-200' };
    }

    switch (key) {
      case 'roads':
        return roadConfig[value as RoadType] || { icon: '?', text: 'Неизвестно', color: 'bg-gray-100 text-gray-500 border-gray-200' };
      case 'drainage':
        return drainageConfig[value as DrainageType] || { icon: '?', text: 'Неизвестно', color: 'bg-gray-100 text-gray-500 border-gray-200' };
      case 'video_surveillance':
        return videoConfig[value as VideoSurveillance] || { icon: '?', text: 'Неизвестно', color: 'bg-gray-100 text-gray-500 border-gray-200' };
      case 'underground_electricity':
        return electricityConfig[value as UndergroundElectricity] || { icon: '?', text: 'Неизвестно', color: 'bg-gray-100 text-gray-500 border-gray-200' };
      default:
        // Use AvailabilityStatus config for other fields
        return {
          icon: icons[value as AvailabilityStatus] || '?',
          text: statusText[value as AvailabilityStatus] || 'Неизвестно',
          color: colors[value as AvailabilityStatus] || 'bg-gray-100 text-gray-500 border-gray-200'
        };
    }
  }

  type Display = { icon: string; text: string; color: string };

  // Check if there's a difference between settlement and Shelkovo
  function hasDifference(key: string): boolean {
    if (!shelkovoInfra) return false;
    return infra[key as keyof Infrastructure] !== shelkovoInfra[key as keyof Infrastructure];
  }

  // Order of infrastructure items for display
  const infraOrder = [
    'roads', 'sidewalks', 'lighting', 'gas', 'water', 'sewage', 'drainage',
    'checkpoints', 'security', 'fencing', 'video_surveillance', 'underground_electricity',
    'playgrounds', 'sports', 'public_spaces', 'beach_or_water_access', 'admin_building', 'retail_or_services'
  ];
</script>

<div class="overflow-x-auto">
  {#snippet badge(display: Display, tid?: string)}
    <span
      data-testid={tid}
      class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium {display.color}"
    >
      <span class="flex h-4 w-4 items-center justify-center">{display.icon}</span>
      <span class="hidden sm:inline">{display.text}</span>
    </span>
  {/snippet}

  {#snippet diff(diff: boolean)}
    {#if diff}
      <span
        data-testid="diff-indicator"
        class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600"
        title="Отличается от Шелково"
      >
        ≠
      </span>
    {:else}
      <span
        class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-600"
        title="Совпадает с Шелково"
      >
        =
      </span>
    {/if}
  {/snippet}

  <table class="w-full border-collapse text-left">
    <thead>
      <tr class="border-b border-slate-200 bg-slate-50">
        <th class="px-4 py-3 text-sm font-semibold text-slate-600">Инфраструктура</th>
        <th class="px-4 py-3 text-center text-sm font-semibold text-slate-600">Статус</th>
        {#if shelkovoInfra}
          <th class="px-4 py-3 text-center text-sm font-semibold text-slate-600">Шелково</th>
          <th class="w-16 px-4 py-3 text-center text-sm font-semibold text-slate-600"></th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each infraOrder as key (key)}
        {@const value = infra[key as keyof Infrastructure]}
        {@const shelkovoValue = shelkovoInfra?.[key as keyof Infrastructure]}
        {@const isDifferent = hasDifference(key)}
        {@const display = getDisplayConfig(key, value)}
        {@const shelkovoDisplay = shelkovoInfra ? getDisplayConfig(key, shelkovoValue) : null}
        <tr data-testid="infra-row" class="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
          <td class="px-4 py-3 text-sm text-slate-900">
            {labels[key] || key}
          </td>
          <td class="px-4 py-3 text-center">
            {@render badge(display, 'infra-status')}
          </td>
          {#if shelkovoInfra && shelkovoValue && shelkovoDisplay}
            <td class="px-4 py-3 text-center">
              {@render badge(shelkovoDisplay, 'shelkovo-status')}
            </td>
            <td class="px-4 py-3 text-center">
              {@render diff(isDifferent)}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
