<script lang="ts">
  import { onMount, onDestroy, untrack } from 'svelte';
  import { formatTariff } from '../lib/format';
  import { withBase } from '../lib/url';

  interface SettlementMapData {
    slug: string;
    name: string;
    shortName: string;
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
    removeChild?: (child: unknown) => void;
    update?: (props: { location: { center: [number, number]; zoom: number } }) => void;
    destroy: () => void;
  }

  interface MarkerLike {
    marker: unknown;
    el: HTMLElement;
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
  let popupEl: HTMLDivElement | null = $state(null);
  let map: YMapLike | null = $state(null);
  let marks: MarkerLike[] = $state([]);
  let isLoading = $state(true);
  let error: string | null = $state(null);
  let ymapsLoaded = $state(false);
  interface Tip {
    item: SettlementMapData;
    x: number;
    y: number;
    up: boolean;
  }

  let tip: Tip | null = $state(null);

  const API_KEY = import.meta.env.PUBLIC_YANDEX_MAPS_API_KEY || '';

  function getTariffColor(tariff: number, isBaseline: boolean): string {
    if (isBaseline) {
      return '#0369a1';
    }
    const minTariff = 50;
    const maxTariff = 200;
    const normalized = Math.max(0, Math.min(1, (tariff - minTariff) / (maxTariff - minTariff)));
    const red = Math.round(180 + 50 * normalized);
    const green = Math.round(130 + 70 * (1 - normalized));
    const blue = Math.round(86 + 30 * (1 - normalized));
    return `rgb(${red}, ${green}, ${blue})`;
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

  function getMapView(): { center: [number, number]; zoom: number } {
    if (settlements.length === 0) {
      return { center: [37.6173, 55.7558], zoom: 9 };
    }

    if (settlements.length === 1) {
      const item = settlements[0];
      return { center: [item.lng, item.lat], zoom: 12 };
    }

    const lat = settlements.map(s => s.lat);
    const lng = settlements.map(s => s.lng);
    const minLat = Math.min(...lat);
    const maxLat = Math.max(...lat);
    const minLng = Math.min(...lng);
    const maxLng = Math.max(...lng);
    const span = Math.max(maxLat - minLat, maxLng - minLng);
    let zoom = 11;

    if (span > 1) zoom = 8;
    else if (span > 0.6) zoom = 9;
    else if (span > 0.3) zoom = 10;
    else if (span > 0.15) zoom = 11;
    else if (span > 0.07) zoom = 12;
    else zoom = 13;

    return {
      center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
      zoom,
    };
  }

  function clearMarkers(): void {
    if (!map) return;

    for (const item of marks) {
      map.removeChild?.(item.marker);
    }
    marks = [];
  }

  function renderMarkers(ymaps3: YMapAPI): void {
    if (!map) return;

    const { YMapMarker } = ymaps3;
    clearMarkers();

    for (const settlement of settlements) {
      const color = getTariffColor(settlement.normalizedTariff, settlement.isBaseline);
      const el = document.createElement('div');
      el.style.cssText = `
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(15, 23, 42, 0.35);
        cursor: pointer;
      `;
      el.setAttribute('title', settlement.name);
      el.setAttribute('aria-label', `Маркер: ${settlement.name}`);
      el.addEventListener('click', (evt) => {
        evt.stopPropagation();
        open(settlement, el);
      });

      const marker = new YMapMarker(
        {
          coordinates: [settlement.lng, settlement.lat],
        },
        el
      );

      map.addChild(marker);
      marks.push({ marker, el });
    }
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

      const view = getMapView();
      
      map = new YMap(
        mapContainer,
        {
          location: {
            center: view.center,
            zoom: view.zoom,
          },
        },
        [
          new YMapDefaultSchemeLayer(),
          new YMapDefaultFeaturesLayer(),
        ]
      );

      renderMarkers(ymaps3);

      isLoading = false;
    } catch (err) {
      console.error('Map initialization error:', err);
      error = 'Ошибка при загрузке карты';
      isLoading = false;
    }
  }

  async function syncMap(): Promise<void> {
    const ymaps3 = window.ymaps3;
    if (!ymaps3 || !mapContainer) return;

    if (!map) {
      await initMap();
      return;
    }

    tip = null;
    renderMarkers(ymaps3);
    const view = getMapView();
    if (!map.update) {
      map.destroy();
      map = null;
      await initMap();
      return;
    }
    map.update?.({
      location: {
        center: view.center,
        zoom: view.zoom,
      },
    });
  }

  function open(item: SettlementMapData, el: HTMLElement): void {
    if (!mapContainer) {
      tip = { item, x: 24, y: 24, up: false };
      return;
    }

    const mapBox = mapContainer.getBoundingClientRect();
    const dotBox = el.getBoundingClientRect();
    const w = 256;
    const p = 12;
    const cx = dotBox.left - mapBox.left + dotBox.width / 2;
    const cy = dotBox.top - mapBox.top + dotBox.height / 2;
    const x = Math.max(p + w / 2, Math.min(mapBox.width - p - w / 2, cx));
    const up = cy > 120;
    const y = up ? cy - 16 : cy + 16;

    tip = { item, x, y, up };
  }

  onMount(async () => {
    const onDown = (evt: PointerEvent): void => {
      if (!tip) return;

      const node = evt.target;
      if (!(node instanceof Node)) return;
      if (popupEl?.contains(node)) return;

      tip = null;
    };

    document.addEventListener('pointerdown', onDown);

    try {
      await loadYandexMaps();
    } catch (err) {
      console.error('Map setup error:', err);
      error = 'Карта недоступна';
      isLoading = false;
    }

    return () => {
      document.removeEventListener('pointerdown', onDown);
    };
  });

  onDestroy(() => {
    clearMarkers();
    if (map) {
      map.destroy();
      map = null;
    }
  });

  $effect(() => {
    const sig = settlements.map(s => `${s.slug}:${s.lat}:${s.lng}:${s.normalizedTariff}`).join('|');
    sig;
    if (!ymapsLoaded || !mapContainer || error) return;
    untrack(() => {
      void syncMap();
    });
  });
</script>

<div data-testid="settlement-map" class="ui-shell relative h-[375px] w-full overflow-hidden">
  {#if isLoading}
    <div class="absolute inset-0 flex items-center justify-center bg-slate-50">
      <div class="text-center">
        <div class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-slate-700"></div>
        <p class="text-sm text-slate-600">Загрузка карты...</p>
      </div>
    </div>
  {/if}

  {#if error}
    <div class="absolute inset-0 flex items-center justify-center bg-slate-50">
      <div class="text-center max-w-md px-4">
        <div class="text-4xl mb-3">🗺️</div>
        <p class="mb-2 font-medium text-slate-700">{error}</p>
        <p class="text-sm text-slate-500">Попробуйте обновить страницу</p>
      </div>
    </div>
  {/if}

  {#if tip}
    <div
      class="pointer-events-none absolute z-10"
      style={`left: ${tip.x}px; top: ${tip.y}px; transform: translate(-50%, ${tip.up ? '-100%' : '0%'});`}
      data-testid="map-popup"
    >
      <div class="relative">
        <div bind:this={popupEl} class="pointer-events-auto w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <div class="mb-1 flex items-start justify-between gap-3">
            <p class="text-base font-semibold text-slate-900">{tip.item.shortName}</p>
            <button
              type="button"
              class="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Закрыть попап"
              onclick={() => {
                tip = null;
              }}
            >
              <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15"></path>
              </svg>
            </button>
          </div>
          <p class="mb-2 text-sm text-slate-600"><strong>{formatTariff(tip.item.normalizedTariff)}</strong></p>
          <a
            class="text-sm font-medium text-sky-700 hover:text-sky-900"
            href={withBase(`settlements/${tip.item.slug}/`)}
            target="_parent"
            data-testid="map-popup-link"
          >
            Подробнее ->
          </a>
        </div>
        <div
          class={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border border-slate-200 bg-white ${tip.up ? '-bottom-1.5 border-t-0 border-l-0' : '-top-1.5 border-b-0 border-r-0'}`}
          aria-hidden="true"
        ></div>
      </div>
    </div>
  {/if}

  <div bind:this={mapContainer} class="w-full h-full" style="min-height: 375px;"></div>
</div>

<style>
  :global(.ymaps-2-1-79-map) {
    width: 100% !important;
    height: 100% !important;
  }
</style>
