const tableShellSelector = '[data-reglament-table-shell]';

let stickyTableRaf = 0;
let stickyTableListenersBound = false;

const isTableHeaderStuck = (
  shell: HTMLElement,
  headerCell: HTMLElement,
): boolean => {
  const top = Number.parseFloat(getComputedStyle(headerCell).top) || 0;
  const shellRect = shell.getBoundingClientRect();
  const headerHeight = headerCell.getBoundingClientRect().height;

  return shellRect.top < top && shellRect.bottom > top + headerHeight;
};

const updateReglamentStickyTableHeaders = (): void => {
  document
    .querySelectorAll<HTMLElement>(tableShellSelector)
    .forEach((shell) => {
      const headerCell = shell.querySelector<HTMLElement>('thead th');

      if (!headerCell) {
        shell.removeAttribute('data-reglament-table-stuck');
        return;
      }

      shell.toggleAttribute(
        'data-reglament-table-stuck',
        isTableHeaderStuck(shell, headerCell),
      );
    });
};

const scheduleReglamentStickyTableHeadersUpdate = (): void => {
  if (stickyTableRaf) return;

  stickyTableRaf = requestAnimationFrame(() => {
    stickyTableRaf = 0;
    updateReglamentStickyTableHeaders();
  });
};

const bindReglamentStickyTableHeaderListeners = (): void => {
  if (stickyTableListenersBound) return;

  window.addEventListener('scroll', scheduleReglamentStickyTableHeadersUpdate, {
    passive: true,
  });
  window.addEventListener('resize', scheduleReglamentStickyTableHeadersUpdate);
  stickyTableListenersBound = true;
};

export const hydrateReglamentStickyTableHeaders = (): void => {
  bindReglamentStickyTableHeaderListeners();
  updateReglamentStickyTableHeaders();
};
