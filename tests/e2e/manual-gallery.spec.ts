import { expect, test } from '@playwright/test';

const walk = [
  'Young Woman with a Water Pitcher',
  'A Gorge in the Mountains (Kauterskill Clove)',
  'Wheat Field with Cypresses',
  'Under the Wave off Kanagawa (The Great Wave)',
  'The Dance Class',
  'The Boulevard Montmartre on a Winter Morning',
];

test('edge arrows walk all six works and share browser history state', async ({
  page,
}) => {
  await page.goto('/');

  const next = page.getByRole('button', { name: /^Next artwork:/ });
  for (const title of walk) {
    await next.click();
    await expect(page.getByRole('heading', { level: 2, name: title })).toBeVisible();
  }

  await expect(page).toHaveURL(/\?artwork=pissarro-boulevard-montmartre$/);

  await page.goBack();
  await expect(
    page.getByRole('heading', { level: 2, name: 'The Dance Class' }),
  ).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Artwork 6 of 6');
});

test('artwork aspect ratios do not move the label or speaking style', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  for (const viewport of [
    { width: 802, height: 1245 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('.artwork-image')).toBeVisible();
    await expect(page.locator('.artwork-figure')).toHaveCSS(
      'transform',
      'none',
    );

    const positions = async () =>
      page.evaluate(() => {
        const top = (selector: string) =>
          document.querySelector(selector)!.getBoundingClientRect().top;
        const bottom = (selector: string) =>
          document.querySelector(selector)!.getBoundingClientRect().bottom;

        return {
          labelTop: top('.artwork-label'),
          progressTop: top('.carousel-progress'),
          styleTop: top('.style-select'),
          styleBottom: bottom('.style-select'),
          plateBottom: bottom('.artwork-plate'),
        };
      });

    const initial = await positions();
    const next = page.getByRole('button', { name: /^Next artwork:/ });

    for (const title of walk.slice(0, -1)) {
      await next.click();
      await expect(
        page.getByRole('heading', { level: 2, name: title }),
      ).toBeVisible();
      await expect(page.locator('.artwork-figure')).toHaveCount(1);
      await expect(page.locator('.artwork-figure')).toHaveCSS(
        'transform',
        'none',
      );

      const current = await positions();
      expect(current.labelTop).toBeCloseTo(initial.labelTop, 0);
      expect(current.progressTop).toBeCloseTo(initial.progressTop, 0);
      expect(current.styleTop).toBeCloseTo(initial.styleTop, 0);
      expect(current.labelTop - current.plateBottom).toBeGreaterThan(8);
      expect(current.styleBottom).toBeLessThanOrEqual(viewport.height);
    }

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test('the cog opens an accessible modal that shares the Speaking style select', async ({
  page,
}) => {
  await page.goto('/');

  const cog = page.getByRole('button', { name: 'Gallery settings' });
  await expect(cog).toBeInViewport();

  // The wall label owns the styles themselves, and no native select.
  await expect(page.locator('select')).toHaveCount(0);
  const wallLabelGroup = page
    .locator('.gallery')
    .getByRole('radiogroup', { name: 'Speaking style' });
  await expect(wallLabelGroup).toBeVisible();

  await cog.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAccessibleName('Gallery settings');

  const modalGroup = dialog.getByRole('radiogroup', { name: 'Speaking style' });
  await expect(
    modalGroup.getByRole('radio', { name: 'Literal' }),
  ).toHaveAttribute('aria-checked', 'true');
  expect(await modalGroup.getByRole('radio').allTextContents()).toEqual([
    '1Literal',
    '2Spatial',
    '3Poetic',
    '4Story',
    '5Curatorial',
  ]);
  await expect(dialog.locator('select')).toHaveCount(0);

  // The background cannot be operated while the modal is open.
  await expect(page.locator('.gallery')).toHaveAttribute('inert', '');

  await modalGroup.getByRole('radio', { name: 'Story' }).click();
  await expect(page.locator('.gallery')).toHaveAttribute('data-mode', 'story');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(cog).toBeFocused();
  await expect(page.getByRole('status')).toContainText('Mode: Story');
  await expect(
    wallLabelGroup.getByRole('radio', { name: 'Story' }),
  ).toHaveAttribute('aria-checked', 'true');
});

test('the wall-label styles answer arrows, Home, End, and the 1-5 number keys', async ({
  page,
}) => {
  await page.goto('/');

  const group = page
    .locator('.gallery')
    .getByRole('radiogroup', { name: 'Speaking style' });
  const option = (name: string) => group.getByRole('radio', { name });
  const checked = async () =>
    (await group.getByRole('radio', { checked: true }).textContent())?.slice(1);

  // No operating-system popup anywhere on the page.
  await expect(page.locator('select')).toHaveCount(0);
  await expect(group).toHaveAccessibleDescription(
    'Arrow keys move through the five styles. Number keys 1 to 5 choose one directly.',
  );

  // Accepted authored regions and the opt-in local analysis action are keyboard
  // stops before the style group; raw detections never appear here.
  await page.locator('#artwork-stage').focus();
  for (const name of [
    'Focus region: The boulevard’s flow',
    'Focus region: The near winter tree',
    'Focus region: The right-hand façades',
    'Analyze regions locally',
  ]) {
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name })).toBeFocused();
  }
  await page.keyboard.press('Tab');
  await expect(option('Literal')).toBeFocused();
  expect(await group.getByRole('radio').evaluateAll((options) =>
    options.filter((element) => element.tabIndex === 0).length,
  )).toBe(1);

  for (const [key, name, mode] of [
    ['ArrowRight', 'Spatial', 'spatial'],
    ['ArrowDown', 'Poetic', 'poetic'],
    ['ArrowLeft', 'Spatial', 'spatial'],
    ['ArrowUp', 'Literal', 'literal'],
    // Wrapping at both ends.
    ['ArrowLeft', 'Curatorial', 'curatorial'],
    ['ArrowRight', 'Literal', 'literal'],
    ['End', 'Curatorial', 'curatorial'],
    ['Home', 'Literal', 'literal'],
  ] as const) {
    await page.keyboard.press(key);
    await expect(option(name)).toBeFocused();
    await expect(option(name)).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('.gallery')).toHaveAttribute('data-mode', mode);
  }

  // The number keys jump straight to the indexed style.
  for (const [key, name, mode] of [
    ['3', 'Poetic', 'poetic'],
    ['5', 'Curatorial', 'curatorial'],
    ['1', 'Literal', 'literal'],
    ['4', 'Story', 'story'],
  ] as const) {
    await page.keyboard.press(key);
    await expect(option(name)).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('.gallery')).toHaveAttribute('data-mode', mode);
    await expect(page.getByRole('status')).toContainText(`Mode: ${name}`);
  }

  // Out-of-range digits leave the style alone.
  await page.keyboard.press('6');
  expect(await checked()).toBe('Story');

  // Space and Enter confirm whatever has focus.
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  expect(await checked()).toBe('Curatorial');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  expect(await checked()).toBe('Literal');

  // A pointer reaches the same styles.
  await option('Poetic').click();
  await expect(page.locator('.gallery')).toHaveAttribute('data-mode', 'poetic');
});

test('keyboard-only visitors can reach the artwork, the modal, and back out', async ({
  page,
}) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Skip to the artwork' });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#artwork-stage')).toBeFocused();

  const cog = page.getByRole('button', { name: 'Gallery settings' });
  await cog.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('heading', { level: 2, name: 'Gallery settings' }),
  ).toBeFocused();

  await dialog.getByRole('button', { name: 'Back to the gallery' }).click();
  await expect(dialog).toBeHidden();
  await expect(cog).toBeFocused();
});

test('a keyboard-only visitor can change the Speaking style inside settings', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Gallery settings' }).focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog');
  const modalGroup = dialog.getByRole('radiogroup', { name: 'Speaking style' });
  await modalGroup.getByRole('radio', { name: 'Literal' }).focus();
  await page.keyboard.press('2');
  await expect(
    modalGroup.getByRole('radio', { name: 'Spatial' }),
  ).toHaveAttribute('aria-checked', 'true');
  await expect(modalGroup.getByRole('radio', { name: 'Spatial' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(
    page
      .locator('.gallery')
      .getByRole('radiogroup', { name: 'Speaking style' })
      .getByRole('radio', { name: 'Spatial' }),
  ).toHaveAttribute('aria-checked', 'true');
});

test('narrow, zoomed, and reduced-motion visitors keep the whole experience', async ({
  page,
}) => {
  // 640 x 640 approximates a 1280 x 1280 window at 200% browser zoom.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 640, height: 640 });
  await page.goto('/?artwork=vermeer-woman-with-water-pitcher');

  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Young Woman with a Water Pitcher',
    }),
  ).toBeVisible();

  const image = page.locator('.artwork-image');
  await expect(image).toBeVisible();
  const box = await image.boundingBox();
  expect(box!.width).toBeLessThanOrEqual(640);
  expect(box!.height).toBeGreaterThan(180);

  // Nothing spills sideways at a narrow width.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);

  // Slivers of the neighbouring works stay restrained at a narrow width.
  const peek = page.locator('.carousel-peek').first();
  const peekBox = await peek.boundingBox();
  expect(peekBox!.width).toBeLessThan(box!.width * 0.25);

  const cog = page.getByRole('button', { name: 'Gallery settings' });
  await expect(cog).toBeInViewport();
  await cog.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole('radiogroup', { name: 'Speaking style' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('a failed image keeps the record, the frame, and the accessible state', async ({
  page,
}) => {
  await page.route('**/artworks/*.jpg', (route) => route.abort());
  await page.goto('/');

  await expect(
    page.getByRole('img', { name: /Image unavailable: The Boulevard Montmartre/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'The Boulevard Montmartre on a Winter Morning',
    }),
  ).toBeVisible();
  await expect(page.locator('.artwork-plate')).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Artwork 1 of 6');
});
