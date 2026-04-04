<script lang="ts">
  import type { Infrastructure, AvailabilityStatus, RoadType, DrainageType, VideoSurveillance, UndergroundElectricity } from '../lib/schema';

  interface Props {
    title?: string;
    infra: Infrastructure;
    shelkovoInfra?: Infrastructure | null;
  }

  let { title = '', infra, shelkovoInfra = null }: Props = $props();
  let only = $state(false);

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
  const tones: Record<AvailabilityStatus, string> = {
    yes: 'ui-badge-success',
    no: 'ui-badge-danger',
    partial: 'ui-badge-warning',
    unknown: 'ui-badge-muted'
  };

  // Get status text for AvailabilityStatus
  const statusText: Record<AvailabilityStatus, string> = {
    yes: 'Есть',
    no: 'Нет',
    partial: 'Частично',
    unknown: 'Неизвестно'
  };

  // Road type display config
  const roadConfig: Record<RoadType, { icon: string; text: string; tone: string }> = {
    asphalt: { icon: '●', text: 'Асфальт', tone: 'ui-badge-success' },
    partial_asphalt: { icon: '◐', text: 'Частично асфальт', tone: 'ui-badge-warning' },
    gravel: { icon: '○', text: 'Крошка', tone: 'ui-badge-warning' },
    dirt: { icon: '✗', text: 'Грунт', tone: 'ui-badge-danger' }
  };

  // Drainage type display config
  const drainageConfig: Record<DrainageType, { icon: string; text: string; tone: string }> = {
    closed: { icon: '✓', text: 'Закрытая', tone: 'ui-badge-success' },
    open: { icon: '◐', text: 'Открытая', tone: 'ui-badge-warning' },
    none: { icon: '✗', text: 'Отсутствует', tone: 'ui-badge-danger' }
  };

  // Video surveillance display config
  const videoConfig: Record<VideoSurveillance, { icon: string; text: string; tone: string }> = {
    full: { icon: '✓', text: 'Есть', tone: 'ui-badge-success' },
    checkpoint_only: { icon: '◐', text: 'Только на КПП', tone: 'ui-badge-warning' },
    none: { icon: '✗', text: 'Нет', tone: 'ui-badge-danger' }
  };

  // Underground electricity display config
  const electricityConfig: Record<UndergroundElectricity, { icon: string; text: string; tone: string }> = {
    full: { icon: '✓', text: 'Полностью', tone: 'ui-badge-success' },
    partial: { icon: '◐', text: 'Частично', tone: 'ui-badge-warning' },
    none: { icon: '✗', text: 'По столбам', tone: 'ui-badge-danger' }
  };

  // Get display config for a specific infrastructure key and value
  function getDisplayConfig(key: string, value: string | undefined): { icon: string; text: string; tone: string } {
    if (value === undefined) {
      return { icon: '?', text: 'Неизвестно', tone: 'ui-badge-muted' };
    }

    switch (key) {
      case 'roads':
        return roadConfig[value as RoadType] || { icon: '?', text: 'Неизвестно', tone: 'ui-badge-muted' };
      case 'drainage':
        return drainageConfig[value as DrainageType] || { icon: '?', text: 'Неизвестно', tone: 'ui-badge-muted' };
      case 'video_surveillance':
        return videoConfig[value as VideoSurveillance] || { icon: '?', text: 'Неизвестно', tone: 'ui-badge-muted' };
      case 'underground_electricity':
        return electricityConfig[value as UndergroundElectricity] || { icon: '?', text: 'Неизвестно', tone: 'ui-badge-muted' };
      default:
        // Use AvailabilityStatus config for other fields
        return {
          icon: icons[value as AvailabilityStatus] || '?',
          text: statusText[value as AvailabilityStatus] || 'Неизвестно',
          tone: tones[value as AvailabilityStatus] || 'ui-badge-muted'
        };
    }
  }

  type Display = { icon: string; text: string; tone: string };

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

  const rows = $derived(only && shelkovoInfra ? infraOrder.filter((key) => hasDifference(key)) : infraOrder);
</script>

<div class="overflow-x-auto">
  {#if title}
    <div class={`mb-5 ${shelkovoInfra ? 'grid grid-cols-[1fr_auto_auto_4rem] items-center' : 'flex items-center justify-between gap-4'}`}>
      <h2 class={`text-xl font-semibold text-foreground ${shelkovoInfra ? 'col-span-3' : ''}`}>{title}</h2>
      {#if shelkovoInfra}
        <button
          type="button"
          data-testid="infra-diff-toggle"
          aria-pressed={only}
          aria-label={only ? 'Показать все свойства' : 'Показать только отличающиеся свойства'}
          title={only ? 'Показать все свойства' : 'Показать только отличающиеся свойства'}
          class={`ui-pill justify-self-center min-h-9 px-3 py-1.5 cursor-pointer text-sm font-semibold transition hover:opacity-90 active:opacity-80 ${only ? 'ui-pill-warning' : 'ui-pill-muted'}`}
          onclick={() => (only = !only)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
            <path d="M3 4.75A.75.75 0 0 1 3.75 4h12.5a.75.75 0 0 1 .57 1.238L12 10.84V15a.75.75 0 0 1-.352.636l-2.5 1.563A.75.75 0 0 1 8 16.563v-5.722L3.18 5.238A.75.75 0 0 1 3 4.75Z" />
          </svg>
        </button>
      {/if}
    </div>
  {/if}

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
        <th>Инфраструктура</th>
        <th class="text-center">Статус</th>
        {#if shelkovoInfra}
          <th class="text-center">Шелково</th>
          <th class="w-16 text-center"></th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#if rows.length === 0}
        <tr class="ui-table-row">
          <td class="ui-table-cell text-center text-sm text-muted-foreground" colspan={shelkovoInfra ? 4 : 2}>
            Отличий с Шелково не найдено
          </td>
        </tr>
      {:else}
        {#each rows as key (key)}
          {@const value = infra[key as keyof Infrastructure]}
          {@const shelkovoValue = shelkovoInfra?.[key as keyof Infrastructure]}
          {@const isDifferent = hasDifference(key)}
          {@const display = getDisplayConfig(key, value)}
          {@const shelkovoDisplay = shelkovoInfra ? getDisplayConfig(key, shelkovoValue) : null}
          <tr data-testid="infra-row" class="ui-table-row">
            <td class="ui-table-cell text-sm text-foreground">
              {labels[key] || key}
            </td>
            <td class="ui-table-cell ui-table-cell-center">
              {@render badge(display, 'infra-status')}
            </td>
            {#if shelkovoInfra && shelkovoDisplay}
              <td class="ui-table-cell ui-table-cell-center">
                {@render badge(shelkovoDisplay, 'shelkovo-status')}
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
