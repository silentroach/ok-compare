<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { formatTariff } from '../lib/format';
  import { withBase } from '../lib/url';

  interface SettlementMapData {
    slug: string;
    name: string;
    lat: number;
    lng: number;
    normalizedTariff: number;
    isBaseline: boolean;
  }

  interface Props {
    settlements: SettlementMapData[];
  }

  let { settlements }: Props = $props();

  // State
  let mapContainer: HTMLDivElement | null = $state(null);
  let map: any = $state(null);
  let isLoading = $state(true);
  let error: string | null = $state(null);
  let ymapsLoaded = $state(false);

  // Yandex Maps API key from environment
  const API_KEY = import.meta.env.PUBLIC_YANDEX_MAPS_API_KEY || '';

  // Get color based on tariff level (green = low, red = high)
  function getTariffColor(tariff: number, isBaseline: boolean): string {
    if (isBaseline) {
      return '#3B82F6'; // Blue for baseline
    }
    // Simple color scale: green (low) to red (high)
    // Assuming range 50-200 rub/sotka/month
    const minTariff = 50;
    const maxTariff = 200;
    const normalized = Math.max(0, Math.min(1, (tariff - minTariff) / (maxTariff - minTariff)));
    
    // Green (hsl 120) to Red (hsl 0)
    const hue = 120 - (normalized * 120);
    return `hsl(${hue}, 70%, 45%)`;
  }

  // Create popup content
  function createPopupContent(settlement: SettlementMapData): string {
    const tariffFormatted = formatTariff(settlement.normalizedTariff);
    const baselineBadge = settlement.isBaseline
      ? '<span style="background: #3B82F6; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">Наш</span>'
      : '';

    return `
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 8px; min-width: 180px;">
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; display: flex; align-items: center;">
          ${settlement.name}
          ${baselineBadge}
        </div>
        <div style="color: #374151; margin-bottom: 12px;">
          Тариф: <strong>${tariffFormatted}</strong>
        </div>
        <a href="${withBase(`settlements/${settlement.slug}/`)}"
           style="color: #2563EB; text-decoration: none; font-size: 14px;"
           target="_parent">
          Подробнее →
        </a>
      </div>
    `;
  }

  // Load Yandex Maps API dynamically
  async function loadYandexMaps(): Promise<void> {
    // Small delay to allow loading state to render first
    await new Promise(resolve => setTimeout(resolve, 50));

    if (!API_KEY) {
      error = 'API ключ не настроен';
      isLoading = false;
      return;
    }

    // Check if already loaded
    if (typeof (window as any).ymaps !== 'undefined') {
      ymapsLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/3.0/?apikey=${API_KEY}&lang=ru_RU`;
      script.async = true;
      
      script.onload = () => {
        ymapsLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        error = 'Не удалось загрузить карту';
        isLoading = false;
        reject(new Error('Failed to load Yandex Maps'));
      };

      document.head.appendChild(script);
    });
  }

  // Initialize map
  async function initMap(): Promise<void> {
    if (!mapContainer || !ymapsLoaded) return;

    try {
      const ymaps = (window as any).ymaps;
      
      if (!ymaps) {
        error = 'Yandex Maps API не доступен';
        isLoading = false;
        return;
      }

      // Wait for ymaps to be ready
      await ymaps.ready();

      // Create map
      map = new ymaps.Map(mapContainer, {
        center: getMapCenter(),
        zoom: 11,
      });

      // Add markers for each settlement
      settlements.forEach((settlement) => {
        const placemark = new ymaps.Placemark(
          [settlement.lat, settlement.lng],
          {
            balloonContent: createPopupContent(settlement),
            settlementData: settlement,
          },
          {
            iconColor: getTariffColor(settlement.normalizedTariff, settlement.isBaseline),
            preset: settlement.isBaseline 
              ? 'islands#blueDotIcon' 
              : 'islands#circleDotIcon',
            iconCaption: settlement.name.substring(0, 15),
            iconCaptionMaxWidth: '100',
          }
        );

        map.geoObjects.add(placemark);
      });

      isLoading = false;
    } catch (err) {
      console.error('Map initialization error:', err);
      error = 'Ошибка при загрузке карты';
      isLoading = false;
    }
  }

  // Calculate map center (prefer baseline, or use average)
  function getMapCenter(): [number, number] {
    const baseline = settlements.find(s => s.isBaseline);
    if (baseline) {
      return [baseline.lat, baseline.lng];
    }

    // Calculate average position
    if (settlements.length === 0) {
      return [55.7558, 37.6173]; // Moscow center as fallback
    }

    const avgLat = settlements.reduce((sum, s) => sum + s.lat, 0) / settlements.length;
    const avgLng = settlements.reduce((sum, s) => sum + s.lng, 0) / settlements.length;
    return [avgLat, avgLng];
  }

  onMount(async () => {
    try {
      await loadYandexMaps();
      await initMap();
    } catch (err) {
      console.error('Map setup error:', err);
      error = 'Карта недоступна';
      isLoading = false;
    }
  });

  onDestroy(() => {
    if (map) {
      map.destroy();
      map = null;
    }
  });
</script>

<div data-testid="settlement-map" class="relative w-full h-[500px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
  {#if isLoading}
    <div class="absolute inset-0 flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p class="text-gray-600 text-sm">Загрузка карты...</p>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="absolute inset-0 flex items-center justify-center bg-gray-50">
      <div class="text-center px-4">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-gray-700 font-medium mb-1">Карта недоступна</p>
        <p class="text-gray-500 text-sm">{error}</p>
      </div>
    </div>
  {/if}

  <div bind:this={mapContainer} class="w-full h-full" class:hidden={isLoading || error}></div>

  <!-- Legend -->
  {#if !isLoading && !error && settlements.length > 0}
    <div class="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 text-xs">
      <div class="font-medium text-gray-700 mb-2">Тариф:</div>
      <div class="space-y-1.5">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" style="background: #22C55E;"></span>
          <span class="text-gray-600">Низкий (до 100 ₽)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" style="background: #EAB308;"></span>
          <span class="text-gray-600">Средний (100-150 ₽)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" style="background: #EF4444;"></span>
          <span class="text-gray-600">Высокий (150+ ₽)</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" style="background: #3B82F6;"></span>
          <span class="text-gray-600">Шелково (базовый)</span>
        </div>
      </div>
    </div>
  {/if}
</div>
