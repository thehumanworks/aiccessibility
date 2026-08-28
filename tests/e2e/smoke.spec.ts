import { expect, test } from '@playwright/test';

test('opens on one dominant, framed artwork', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/AIccessibility/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'AIccessibility' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'The Boulevard Montmartre on a Winter Morning',
    }),
  ).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Mode: Literal');

  const image = page.locator('.artwork-image');
  await expect(image).toBeVisible();

  // The painting must genuinely dominate the viewport.
  const viewport = page.viewportSize();
  const box = await image.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThan(viewport!.height * 0.55);
  expect(box!.width).toBeGreaterThan(viewport!.width * 0.35);
  expect(box!.width * box!.height).toBeGreaterThan(
    viewport!.width * viewport!.height * 0.2,
  );

  // The generated Renaissance frame surrounds it without touching the art.
  const plate = page.locator('.artwork-plate');
  await expect(plate).toHaveCSS(
    'border-image-source',
    /renaissance-frame\.png/,
  );
  const borderTop = await plate.evaluate(
    (element) => Number.parseFloat(getComputedStyle(element).borderTopWidth),
  );
  expect(borderTop).toBeGreaterThan(10);

  // No boxed chrome anywhere in the page flow.
  await expect(page.locator('.gallery aside')).toHaveCount(0);
  await expect(page.locator('.gallery fieldset')).toHaveCount(0);
  await expect(page.locator('.artwork-fallback')).toHaveCount(0);
});
