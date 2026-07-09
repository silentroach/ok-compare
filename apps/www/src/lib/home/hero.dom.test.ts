import { afterEach, describe, expect, it } from 'vitest';

import {
  getHomeHeroMode,
  hydrateHomeHero,
  installHomeHeroHydration,
} from './hero';

const renderHomeHero = (): void => {
  document.body.innerHTML = `
    <section data-home-hero-mode="day">
      <img
        data-home-hero-image
        data-day-src="/day.webp"
        data-day-srcset="/day-960.webp 960w, /day-1280.webp 1280w"
        data-night-src="/night.webp"
        data-night-srcset="/night-960.webp 960w, /night-1280.webp 1280w"
        src="/day.webp"
        srcset="/day-960.webp 960w, /day-1280.webp 1280w"
      />
    </section>
  `;
};

const getShell = (): HTMLElement =>
  document.querySelector('[data-home-hero-mode]') as HTMLElement;

const getImage = (): HTMLImageElement =>
  document.querySelector('[data-home-hero-image]') as HTMLImageElement;

afterEach(() => {
  document.body.innerHTML = '';
  delete window.__shelkovoHomeHeroHydration;
});

describe('getHomeHeroMode', () => {
  it('maps Shelkovo sunrise and sunset to hero modes', () => {
    expect(getHomeHeroMode(new Date('2026-05-11T12:00:00Z'))).toBe('day');
    expect(getHomeHeroMode(new Date('2026-05-11T17:30:00Z'))).toBe('night');
  });
});

describe('hydrateHomeHero', () => {
  it('switches the server-rendered image to the client time mode', () => {
    renderHomeHero();

    hydrateHomeHero(document, new Date('2026-05-11T17:30:00Z'));

    expect(getShell().dataset.homeHeroMode).toBe('night');
    expect(getImage().getAttribute('src')).toBe('/night.webp');
    expect(getImage().getAttribute('srcset')).toBe(
      '/night-960.webp 960w, /night-1280.webp 1280w',
    );
  });
});

describe('installHomeHeroHydration', () => {
  it('rehydrates the home hero after Astro client navigation', () => {
    const now = () => new Date('2026-05-11T17:30:00Z');

    renderHomeHero();
    installHomeHeroHydration({ now });

    renderHomeHero();
    document.dispatchEvent(new Event('astro:page-load'));

    expect(getShell().dataset.homeHeroMode).toBe('night');
    expect(getImage().getAttribute('src')).toBe('/night.webp');
  });
});
