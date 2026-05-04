import { expect, test } from '@playwright/test';

const screenshot = {
  animations: 'disabled',
  caret: 'hide',
  scale: 'device',
} as const;

test.describe('Icons visual', () => {
  test('renders all shared icons in one catalog', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const target = page.getByTestId('icons-catalog');

    await expect(
      target.getByRole('heading', { name: 'Shared icons' }),
    ).toBeVisible();
    await expect(target.locator('[data-icon-card]')).toHaveCount(14);

    await expect(target).toHaveScreenshot('icons-catalog.png', screenshot);
  });
});
