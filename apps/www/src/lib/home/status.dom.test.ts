import { afterEach, describe, expect, it } from 'vitest';

import { hydrateHomeStatus, installHomeStatusHydration } from './status';

const WINDOW_START = 1779094800000;
const WINDOW_END = 1779105600000;
const DEFAULT_WINDOWS_PAYLOAD = `[{"start":${WINDOW_START},"end":${WINDOW_END}}]`;
const AMBER_ARIA_LABEL = 'Статус: идут плановые работы';
const GREEN_ARIA_LABEL = 'Статус: все сервисы работают';

const renderHomeStatus = ({
  state = 'green',
  includePayload = true,
  payload = DEFAULT_WINDOWS_PAYLOAD,
}: {
  readonly state?: 'green' | 'amber' | 'red';
  readonly includePayload?: boolean;
  readonly payload?: string;
} = {}): void => {
  const label =
    state === 'red' ? 'есть активные проблемы' : 'все сервисы работают';

  document.body.innerHTML = `
    <a
      href="/status/"
      aria-label="Статус: ${label}"
      data-home-status-link
      data-home-status-state="${state}"
    >
      <span>Статус</span>
      <span aria-hidden="true" data-home-status-dot></span>
    </a>
    ${
      includePayload
        ? `<script type="application/json" data-home-status-maintenance-windows>${payload}</script>`
        : ''
    }
  `;
};

const getStatusLink = (): HTMLElement =>
  document.querySelector('[data-home-status-link]') as HTMLElement;

afterEach(() => {
  document.body.innerHTML = '';
  delete window.__shelkovoHomeStatusHydration;
});

describe('hydrateHomeStatus', () => {
  it('changes green to amber when now is inside an embedded window', () => {
    renderHomeStatus();

    hydrateHomeStatus(document, WINDOW_START + 1);

    expect(getStatusLink().dataset.homeStatusState).toBe('amber');
  });

  it('keeps green before the first embedded window starts', () => {
    renderHomeStatus();

    hydrateHomeStatus(document, WINDOW_START - 1);

    expect(getStatusLink().dataset.homeStatusState).toBe('green');
  });

  it('keeps green when now equals the embedded window end', () => {
    renderHomeStatus();

    hydrateHomeStatus(document, WINDOW_END);

    expect(getStatusLink().dataset.homeStatusState).toBe('green');
  });

  it('changes green to amber when now equals the embedded window start', () => {
    renderHomeStatus();

    hydrateHomeStatus(document, WINDOW_START);

    expect(getStatusLink().dataset.homeStatusState).toBe('amber');
  });

  it('keeps red when now is inside a maintenance window', () => {
    renderHomeStatus({ state: 'red' });

    hydrateHomeStatus(document, WINDOW_START + 1);

    expect(getStatusLink().dataset.homeStatusState).toBe('red');
  });

  it('updates aria-label when it changes the state to amber', () => {
    renderHomeStatus();

    hydrateHomeStatus(document, WINDOW_START + 1);

    expect(getStatusLink().getAttribute('aria-label')).toBe(AMBER_ARIA_LABEL);
  });

  it('does not throw and does not change state when embedded JSON is missing', () => {
    renderHomeStatus({ includePayload: false });

    expect(() => hydrateHomeStatus(document, WINDOW_START + 1)).not.toThrow();
    expect(getStatusLink().dataset.homeStatusState).toBe('green');
    expect(getStatusLink().getAttribute('aria-label')).toBe(GREEN_ARIA_LABEL);
  });

  it('does not throw and does not change state when embedded JSON is malformed', () => {
    renderHomeStatus({ payload: '{' });

    expect(() => hydrateHomeStatus(document, WINDOW_START + 1)).not.toThrow();
    expect(getStatusLink().dataset.homeStatusState).toBe('green');
    expect(getStatusLink().getAttribute('aria-label')).toBe(GREEN_ARIA_LABEL);
  });
});

describe('installHomeStatusHydration', () => {
  it('rehydrates the home status after Astro client navigation', () => {
    const now = (): number => WINDOW_START + 1;

    renderHomeStatus({ payload: '[]' });
    installHomeStatusHydration({ now });

    renderHomeStatus();
    document.dispatchEvent(new Event('astro:page-load'));

    expect(getStatusLink().dataset.homeStatusState).toBe('amber');

    renderHomeStatus();
    document.dispatchEvent(new Event('astro:after-swap'));

    expect(getStatusLink().dataset.homeStatusState).toBe('amber');
  });
});
