declare global {
  interface Window {
    __shelkovoHomeHeroHydration?: boolean;
  }
}

const moscowHourFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  hour12: false,
  timeZone: 'Europe/Moscow',
});

export const getHomeHeroMode = (date = new Date()): 'day' | 'night' => {
  const hour = Number(moscowHourFormatter.format(date));

  return hour >= 6 && hour < 22 ? 'day' : 'night';
};

export const hydrateHomeHero = (
  root: ParentNode = document,
  date = new Date(),
): void => {
  const shell = root.querySelector('[data-home-hero-mode]');
  const image = root.querySelector('[data-home-hero-image]');
  if (!(image instanceof HTMLImageElement)) return;

  const mode = getHomeHeroMode(date);
  const src = image.dataset[`${mode}Src`];
  const srcset = image.dataset[`${mode}Srcset`];

  if (shell instanceof HTMLElement) {
    shell.dataset.homeHeroMode = mode;
  }

  if (src && srcset) {
    image.src = src;
    image.srcset = srcset;
  }
};

export const installHomeHeroHydration = (
  options: { readonly now?: () => Date } = {},
): void => {
  const hydrate = (): void =>
    hydrateHomeHero(document, options.now?.() ?? new Date());

  if (window.__shelkovoHomeHeroHydration) {
    hydrate();
    return;
  }

  window.__shelkovoHomeHeroHydration = true;
  hydrate();
  document.addEventListener('astro:after-swap', hydrate);
  document.addEventListener('astro:page-load', hydrate);
};
