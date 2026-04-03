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

  interface YMapLike {
    addChild: (child: unknown) => void;
    destroy: () => void;
  }

  interface YMapAPI {
    ready: Promise<void>;
    YMap: new (root: HTMLElement, props: { location: { center: [number, number]; zoom: number } }, layers: unknown[]) => YMapLike;
    YMapDefaultSchemeLayer: new () => unknown;
    YMapDefaultFeaturesLayer: new () => unknown;
    YMapMarker: new (props: { coordinates: [number, number] }, el: HTMLElement) => unknown;
  }

  declare global {
    interface Window {
      ymaps3?: YMapAPI;
    }
  }

  let { settlements }: Props = $props();

  let mapContainer: HTMLDivElement | null = $state(null);
  let map: YMapLike | null = $state(null);
  let isLoading = $state(true);
  let error: string | null = $state(null);
  let ymapsLoaded = $state(false);
  let active: SettlementMapData | null = $state(null);

  const API_KEY = import.meta.env.PUBLIC_YANDEX_MAPS_API_KEY || '';

  function getTariffColor(tariff: number, isBaseline: boolean): string {
    if (isBaseline) {
      return '#3B82F6';
    }
    const minTariff = 50;
    const maxTariff = 200;
    const normalized = Math.max(0, Math.min(1, (tariff - minTariff) / (maxTariff - minTariff)));
    const red = Math.round(255 * normalized);
    const green = Math.round(255 * (1 - normalized));
    return `rgb(${red}, ${green}, 0)`;
  }

  async function loadYandexMaps(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 50));

    if (window.ymaps3) {
      ymapsLoaded = true;
      return;
    }

    if (!API_KEY) {
      error = 'API ключ не настроен';
      isLoading = false;
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/v3/?apikey=${API_KEY}&lang=ru_RU`;
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

  async function initMap(): Promise<void> {
    if (!mapContainer || !ymapsLoaded) return;

    try {
      const ymaps3 = window.ymaps3;
      
      if (!ymaps3) {
        error = 'Yandex Maps API не доступен';
        isLoading = false;
        return;
      }

      await ymaps3.ready;

      const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker} = ymaps3;

      const center = getMapCenter();
      
      map = new YMap(
        mapContainer,
        {
          location: {
            center: [center[1], center[0]],
            zoom: 11,
          },
        },
        [
          new YMapDefaultSchemeLayer(),
          new YMapDefaultFeaturesLayer(),
        ]
      );

      for (const settlement of settlements) {
        const color = getTariffColor(settlement.normalizedTariff, settlement.isBaseline);
        const el = document.createElement('div');
        el.style.cssText = `
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        `;
        el.setAttribute('title', settlement.name);
        el.setAttribute('aria-label', `Маркер: ${settlement.name}`);
        el.addEventListener('click', () => {
          active = settlement;
        });
        
        const marker = new YMapMarker(
          {
            coordinates: [settlement.lng, settlement.lat],
          },
          el
        );
        
        map.addChild(marker);
      }

      isLoading = false;
    } catch (err) {
      console.error('Map initialization error:', err);
      error = 'Ошибка при загрузке карты';
      isLoading = false;
    }
  }

  function getMapCenter(): [number, number] {
    const baseline = settlements.find(s => s.isBaseline);
    if (baseline) {
      return [baseline.lat, baseline.lng];
    }

    if (settlements.length === 0) {
      return [55.7558, 37.6173];
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
      <div class="text-center max-w-md px-4">
        <div class="text-4xl mb-3">🗺️</div>
        <p class="text-gray-700 font-medium mb-2">{error}</p>
        <p class="text-gray-500 text-sm">Попробуйте обновить страницу</p>
      </div>
    </div>
  {/if}

  {#if active}
    <div class="absolute left-4 right-4 bottom-4 z-10" data-testid="map-popup">
      <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <div class="mb-1 flex items-start justify-between gap-3">
          <p class="text-base font-semibold text-gray-900">{active.name}</p>
          <button
            type="button"
            class="text-sm text-gray-500 hover:text-gray-700"
            aria-label="Закрыть попап"
            onclick={() => {
              active = null;
            }}
          >
            Закрыть
          </button>
        </div>
        <p class="mb-3 text-sm text-gray-600">Тариф: <strong>{formatTariff(active.normalizedTariff)}</strong></p>
        <a
          class="text-sm font-medium text-blue-600 hover:text-blue-800"
          href={withBase(`settlements/${active.slug}/`)}
          target="_parent"
          data-testid="map-popup-link"
        >
          Подробнее →
        </a>
      </div>
    </div>
  {/if}

  <div bind:this={mapContainer} class="w-full h-full" style="min-height: 500px;"></div>
</div>

<style>
  :global(.ymaps-2-1-79-map) {
    width: 100% !important;
    height: 100% !important;
  }
</style>
