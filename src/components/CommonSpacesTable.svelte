<script lang="ts">
  import type { CommonSpaces, AvailabilityStatus } from '../lib/schema';

  interface Props {
    title?: string;
    spaces: CommonSpaces;
    shelkovoSpaces?: CommonSpaces;
  }

  let { title = '', spaces, shelkovoSpaces }: Props = $props();
  let only = $state(false);

  const labels: Record<string, string> = {
    club_infrastructure: 'Клубная инфраструктура',
    playgrounds: 'Детские площадки',
    sports: 'Спортивные площадки',
    pool: 'Бассейн',
    fitness_club: 'Фитнес-клуб',
    restaurant: 'Ресторан',
    spa_center: 'Спа-центр',
    walking_routes: 'Маршруты для прогулок',
    water_access: 'Выход к воде',
    beach_zones: 'Пляжные зоны',
    kids_club: 'Детский клуб',
    sports_camp: 'Спортивный лагерь',
    primary_school: 'Начальная школа',
    bbq_zones: 'Зоны барбекю',
  };

  const icons: Record<AvailabilityStatus, string> = {
    yes: '✓',
    no: '✗',
    partial: '◐',
  };

  const tones: Record<AvailabilityStatus, string> = {
    yes: 'ui-badge-success',
    no: 'ui-badge-danger',
    partial: 'ui-badge-warning',
  };

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

  function hasDifference(key: string): boolean {
    if (!shelkovoSpaces) return false;
    return (
      spaces[key as keyof CommonSpaces] !==
      shelkovoSpaces[key as keyof CommonSpaces]
    );
  }

  // Keep this first: it summarizes access to many items listed below.
  const order = [
    'club_infrastructure',
    'playgrounds',
    'sports',
    'pool',
    'fitness_club',
    'restaurant',
    'spa_center',
    'walking_routes',
    'water_access',
    'beach_zones',
    'kids_club',
    'sports_camp',
    'primary_school',
    'bbq_zones',
  ];

  const rows = $derived(
    only && shelkovoSpaces ? order.filter((key) => hasDifference(key)) : order,
  );
</script>

<div class="overflow-x-auto">
  {#if title}
    <div
      class={`mb-5 ${shelkovoSpaces ? 'grid grid-cols-[1fr_auto_auto_4rem] items-center' : 'flex items-center justify-between gap-4'}`}
    >
      <h2
        class={`text-xl font-semibold text-foreground ${shelkovoSpaces ? 'col-span-3' : ''}`}
      >
        {title}
      </h2>
      {#if shelkovoSpaces}
        <button
          type="button"
          data-testid="spaces-diff-toggle"
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
        <th>Общие пространства</th>
        <th class="text-center">Статус</th>
        {#if shelkovoSpaces}
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
            colspan={shelkovoSpaces ? 4 : 2}
          >
            Отличий с Шелково не найдено
          </td>
        </tr>
      {:else}
        {#each rows as key (key)}
          {@const value = spaces[key as keyof CommonSpaces]}
          {@const shelkovoValue = shelkovoSpaces?.[key as keyof CommonSpaces]}
          {@const isDifferent = hasDifference(key)}
          {@const display = getDisplay(value)}
          {@const shelkovoDisplay = shelkovoSpaces
            ? getDisplay(shelkovoValue)
            : undefined}
          <tr data-testid="space-row" class="ui-table-row">
            <td class="ui-table-cell text-sm text-foreground">
              {labels[key] || key}
            </td>
            <td class="ui-table-cell ui-table-cell-center">
              {@render badge(display, 'space-status')}
            </td>
            {#if shelkovoSpaces && shelkovoDisplay}
              <td class="ui-table-cell ui-table-cell-center">
                {@render badge(shelkovoDisplay, 'shelkovo-space-status')}
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
