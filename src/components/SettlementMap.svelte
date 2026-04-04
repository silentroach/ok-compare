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
    interactive?: boolean;
    popup?: boolean;
    shell?: boolean;
    muted?: boolean;
    height?: number;
    focusX?: number;
  }

  interface MarkerLike {
    marker: ymaps3.YMapMarker;
    el: HTMLElement;
  }

  declare global {
    interface Window {
      ymaps3?: typeof ymaps3;
    }
  }

  let {
    settlements,
    interactive = true,
    popup = true,
    shell = true,
    muted = false,
    height = 375,
    focusX = 0.5,
  }: Props = $props();

  let mapContainer: HTMLDivElement | null = $state(null);
  let popupEl: HTMLDivElement | null = $state(null);
  let map: ymaps3.YMap | null = $state(null);
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
  const PAD = 32;

  function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
  }

  function shift(lng: number, zoom: number): number {
    if (!mapContainer) return lng;

    const fx = clamp(focusX, 0.05, 0.95);
    if (Math.abs(fx - 0.5) < 0.01) return lng;

    const w = Math.max(1, mapContainer.clientWidth);
    const deg = 360 / (256 * 2 ** zoom);
    return lng - (fx - 0.5) * w * deg;
  }

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

  function getMapView(): {
    location: ymaps3.YMapLocationRequest;
    margin: [number, number, number, number];
  } {
    if (settlements.length === 0) {
      return {
        location: { center: [37.6173, 55.7558], zoom: 9 },
        margin: [0, 0, 0, 0],
      };
    }

    if (settlements.length === 1) {
      const item = settlements[0];
      const zoom = 12;
      return {
        location: { center: [shift(item.lng, zoom), item.lat], zoom },
        margin: [0, 0, 0, 0],
      };
    }

    const lat = settlements.map(s => s.lat);
    const lng = settlements.map(s => s.lng);
    const minLat = Math.min(...lat);
    const maxLat = Math.max(...lat);
    const minLng = Math.min(...lng);
    const maxLng = Math.max(...lng);
    return {
      location: { bounds: [[minLng, minLat], [maxLng, maxLat]] },
      margin: [PAD, PAD, PAD, PAD],
    };
  }

  function clearMarkers(): void {
    if (!map) return;

    for (const item of marks) {
      map.removeChild?.(item.marker);
    }
    marks = [];
  }

  function renderMarkers(ym: typeof ymaps3): void {
    if (!map) return;

    const { YMapMarker } = ym;
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
        cursor: ${interactive && popup ? 'pointer' : 'default'};
      `;
      el.setAttribute('title', settlement.name);
      el.setAttribute('aria-label', `Маркер: ${settlement.name}`);
      if (interactive && popup) {
        el.addEventListener('click', (evt) => {
          evt.stopPropagation();
          open(settlement, el);
        });
      }

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

      const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer} = ymaps3;

      const view = getMapView();
      
      map = new YMap(
        mapContainer,
        {
          location: view.location,
          margin: view.margin,
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
        ...view.location,
        duration: 250,
      },
      margin: view.margin,
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

<div
  data-testid="settlement-map"
  class={`relative w-full overflow-hidden ${shell ? 'ui-shell' : ''}`}
  style={`height: ${height}px; min-height: ${height}px;`}
>
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

  {#if tip && popup}
    <div
      class="pointer-events-none absolute z-10"
      style={`left: ${tip.x}px; top: ${tip.y}px; transform: translate(-50%, ${tip.up ? '-100%' : '0%'});`}
      data-testid="map-popup"
    >
      <div class="relative">
        <div bind:this={popupEl} class="pointer-events-auto w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <div class="mb-1 flex items-start justify-between gap-3">
            <a
              class="text-base font-semibold text-slate-900 hover:text-sky-700"
              href={withBase(`settlements/${tip.item.slug}/`)}
              target="_parent"
              data-testid="map-popup-link"
            >
              {tip.item.shortName}
            </a>
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
        </div>
        <div
          class={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border border-slate-200 bg-white ${tip.up ? '-bottom-1.5 border-t-0 border-l-0' : '-top-1.5 border-b-0 border-r-0'}`}
          aria-hidden="true"
        ></div>
      </div>
    </div>
  {/if}

  <div
    bind:this={mapContainer}
    class={`h-full w-full ${interactive ? '' : 'pointer-events-none'} ${muted ? 'map-muted' : ''}`}
  ></div>

  {#if !interactive}
    <div class="absolute inset-0 z-[5]" aria-hidden="true"></div>
  {/if}
</div>

<style>
  :global(.ymaps-2-1-79-map) {
    width: 100% !important;
    height: 100% !important;
  }

  .map-muted {
    opacity: 0.56;
    filter: saturate(0.62) contrast(0.9) brightness(1.02);
  }
</style>
