import { expect, test } from '@playwright/test';

test.describe('Breadcrumbs visual', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('renders a section trail with a current page item', async ({ page }) => {
    const target = page.getByTestId('breadcrumbs-section');
    const list = target.locator('ol');

    await expect(target.getByRole('link', { name: 'Главная' })).toBeVisible();
    await expect(target.locator('[aria-current="page"]')).toHaveText('Новости');
    await expect(list).toHaveCSS('display', 'flex');

    await expect(target).toHaveScreenshot('breadcrumbs-section.png', {
      animations: 'disabled',
      caret: 'hide',
      scale: 'device',
    });
  });

  test('renders a long trail when the last item stays linked', async ({
    page,
  }) => {
    const target = page.getByTestId('breadcrumbs-article');
    const list = target.locator('ol');

    await expect(
      target.getByRole('link', { name: 'Запуск уличного освещения' }),
    ).toBeVisible();
    await expect(target.locator('[aria-current="page"]')).toHaveCount(0);
    await expect(list).toHaveCSS('display', 'flex');

    await expect(target).toHaveScreenshot('breadcrumbs-article.png', {
      animations: 'disabled',
      caret: 'hide',
      scale: 'device',
    });
  });
});
