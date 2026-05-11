const tableShellSelector = '[data-ui-sticky-table-shell]';

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

const updateStickyTableHeaders = (): void => {
  document
    .querySelectorAll<HTMLElement>(tableShellSelector)
    .forEach((shell) => {
      const headerCell = shell.querySelector<HTMLElement>('thead th');

      if (!headerCell) {
        shell.removeAttribute('data-ui-sticky-table-stuck');
        return;
      }

      shell.toggleAttribute(
        'data-ui-sticky-table-stuck',
        isTableHeaderStuck(shell, headerCell),
      );
    });
};

const scheduleStickyTableHeadersUpdate = (): void => {
  if (stickyTableRaf) return;

  stickyTableRaf = requestAnimationFrame(() => {
    stickyTableRaf = 0;
    updateStickyTableHeaders();
  });
};

const bindStickyTableHeaderListeners = (): void => {
  if (stickyTableListenersBound) return;

  window.addEventListener('scroll', scheduleStickyTableHeadersUpdate, {
    passive: true,
  });
  window.addEventListener('resize', scheduleStickyTableHeadersUpdate);
  stickyTableListenersBound = true;
};

export const hydrateStickyTableHeaders = (): void => {
  bindStickyTableHeaderListeners();
  updateStickyTableHeaders();
};
