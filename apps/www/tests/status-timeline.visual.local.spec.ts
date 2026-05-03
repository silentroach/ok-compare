import { expect, test } from '@playwright/test';

test.describe('StatusServiceTimeline visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('renders mixed timeline with hydrated green gaps and open tooltip', async ({
    page,
  }) => {
    const target = page.getByTestId('status-timeline-mixed');

    await expect(target.locator('[data-status-segment="green"]')).toHaveCount(
      3,
    );

    const problem = target.locator('[data-incident-id="mixed-incident"]');
    await problem.hover();

    await expect(
      target.locator('[data-status-timeline-tooltip]'),
    ).toBeVisible();

    await expect(target).toHaveScreenshot('status-timeline-mixed-tooltip.png', {
      animations: 'disabled',
      caret: 'hide',
      scale: 'device',
    });
  });

  test('renders a full green bar when there are no incidents', async ({
    page,
  }) => {
    const target = page.getByTestId('status-timeline-empty');

    await expect(target.locator('[data-status-segment="green"]')).toHaveCount(
      1,
    );
    await expect(target.locator('[data-status-problem]')).toHaveCount(0);

    await expect(target).toHaveScreenshot('status-timeline-empty.png', {
      animations: 'disabled',
      caret: 'hide',
      scale: 'device',
    });
  });

  test('keeps a short active incident fully visible at the right edge', async ({
    page,
  }) => {
    const target = page.getByTestId('status-timeline-active-edge');

    await expect(target.locator('[data-status-problem]')).toHaveCount(1);

    await expect(target).toHaveScreenshot('status-timeline-active-edge.png', {
      animations: 'disabled',
      caret: 'hide',
      scale: 'device',
    });
  });

  test('visually separates dense problem segments near the right edge', async ({
    page,
  }) => {
    const target = page.getByTestId('status-timeline-dense-problems');

    await expect(target.locator('[data-status-problem]')).toHaveCount(2);

    await expect(target).toHaveScreenshot(
      'status-timeline-dense-problems.png',
      {
        animations: 'disabled',
        caret: 'hide',
        scale: 'device',
      },
    );
  });

  test('renders grouped tooltip rows with the same typography pattern', async ({
    page,
  }) => {
    const target = page.getByTestId('status-timeline-dense-problems');
    const problem = target.locator('[data-incident-id="dense-incident-1"]');

    await problem.hover();

    await expect(
      target.locator('[data-status-timeline-tooltip]'),
    ).toBeVisible();

    await expect(target).toHaveScreenshot(
      'status-timeline-dense-problems-tooltip.png',
      {
        animations: 'disabled',
        caret: 'hide',
        scale: 'device',
      },
    );
  });
});
