import { expect, test, type Page } from '@playwright/test';

const walk = [
  'Young Woman with a Water Pitcher',
  'A Gorge in the Mountains (Kauterskill Clove)',
  'Wheat Field with Cypresses',
  'Under the Wave off Kanagawa (The Great Wave)',
  'The Dance Class',
  'The Boulevard Montmartre on a Winter Morning',
];

async function swipeArtwork(page: Page, direction: 'next' | 'previous') {
  const stage = page.locator('#artwork-stage');
  const box = await stage.boundingBox();
  if (!box) {
    throw new Error('The artwork stage is not visible.');
  }

  const startX = direction === 'next' ? box.x + box.width * 0.78 : box.x + box.width * 0.22;
  const endX = direction === 'next' ? box.x + box.width * 0.22 : box.x + box.width * 0.78;
  const y = box.y + box.height * 0.5;
  const pointer = {
    pointerId: 1,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
  };

  await stage.dispatchEvent('pointerdown', {
    ...pointer,
    clientX: startX,
    clientY: y,
  });
  await stage.dispatchEvent('pointerup', {
    ...pointer,
    clientX: endX,
    clientY: y,
  });
}

async function dragArtworkWithMouse(
  page: Page,
  direction: 'next' | 'previous',
  startSelector: string,
) {
  const startTarget = page.locator(startSelector);
  const box = await startTarget.boundingBox();
  if (!box) {
    throw new Error(`The drag target ${startSelector} is not visible.`);
  }

  const startX = box.x + box.width * 0.5;
  const endX = startX + (direction === 'next' ? -60 : 60);
  const y = box.y + box.height * 0.5;

  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y, { steps: 8 });
  const liveOffset = await page
    .locator('.stage-carousel > .artwork-figure')
    .last()
    .evaluate((figure) => Number.parseFloat(getComputedStyle(figure).translate));
  expect(Math.abs(liveOffset)).toBeGreaterThan(50);
  await page.mouse.up();
}

test('desktop mouse drags move the carousel in both directions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  await dragArtworkWithMouse(page, 'next', '.artwork-image');
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Young Woman with a Water Pitcher',
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\?artwork=vermeer-woman-with-water-pitcher$/);
  await expect(page.getByRole('status')).toContainText('Artwork 2 of 6');
  await expect(page.locator('.carousel-progress-bar').nth(1)).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(page.locator('.stage-carousel > .artwork-figure')).toHaveCount(1);

  await dragArtworkWithMouse(page, 'previous', '.artwork-label');
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'The Boulevard Montmartre on a Winter Morning',
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\?artwork=pissarro-boulevard-montmartre$/);
  await expect(page.getByRole('status')).toContainText('Artwork 1 of 6');
  await expect(page.locator('.carousel-progress-bar').first()).toHaveAttribute(
    'aria-current',
    'true',
  );
});

test('mobile swipes walk all six works and share browser history state', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.nav-arrow')).toHaveCount(0);

  for (const title of walk) {
    await swipeArtwork(page, 'next');
    await expect(page.getByRole('heading', { level: 2, name: title })).toBeVisible();
    await expect(page.locator('.stage-carousel > .artwork-figure')).toHaveCount(1);
  }

  await expect(page).toHaveURL(/\?artwork=pissarro-boulevard-montmartre$/);

  await page.goBack();
  await expect(
    page.getByRole('heading', { level: 2, name: 'The Dance Class' }),
  ).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Artwork 6 of 6');

  await page.mouse.wheel(0, 800);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.locator('.gallery')).toHaveCSS('user-select', 'none');
  await expect(page.locator('.stage-carousel')).toHaveCSS(
    'touch-action',
    'pan-y pinch-zoom',
  );
});

test('mobile artwork stays vertically pinned throughout a full-motion transition', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.stage-carousel > .artwork-figure')).toHaveCount(1);

  await swipeArtwork(page, 'next');
  const samples = await page.evaluate(async () => {
    const points: Array<{ plateBottom: number; labelTop: number }> = [];
    const deadline = performance.now() + 900;

    while (performance.now() < deadline) {
      const heading = [...document.querySelectorAll<HTMLHeadingElement>('.artwork-label h2')]
        .find((element) => element.textContent === 'Young Woman with a Water Pitcher');
      const figure = heading?.closest('.artwork-figure');
      const plate = figure?.querySelector('.artwork-plate');
      const label = figure?.querySelector('.artwork-label');
      if (plate && label) {
        points.push({
          plateBottom: plate.getBoundingClientRect().bottom,
          labelTop: label.getBoundingClientRect().top,
        });
      }

      if (
        points.length > 8 &&
        document.querySelectorAll('.stage-carousel > .artwork-figure').length === 1 &&
        getComputedStyle(figure!).transform === 'none'
      ) {
        break;
      }
      await new Promise(requestAnimationFrame);
    }
    return points;
  });

  expect(samples.length).toBeGreaterThan(8);
  const verticalRange = (key: 'plateBottom' | 'labelTop') => {
    const values = samples.map((sample) => sample[key]);
    return Math.max(...values) - Math.min(...values);
  };
  expect(verticalRange('plateBottom')).toBeLessThanOrEqual(1);
  expect(verticalRange('labelTop')).toBeLessThanOrEqual(1);
  await expect(page.locator('.stage-carousel > .artwork-figure')).toHaveCount(1);
});

test('artwork aspect ratios do not move the label or speaking style', async ({
  page,
}) => {
  for (const viewport of [
    { width: 802, height: 1245 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
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
    const stage = page.locator('#artwork-stage');

    for (const title of walk.slice(0, -1)) {
      await stage.focus();
      await page.keyboard.press('ArrowRight');
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

  // Personalization selects live in settings; the wall keeps only the style radios.
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
  await expect(dialog.locator('select')).toHaveCount(5);

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

  // The artwork starts clean: agent-triggered detections do not add dormant
  // hotspot tab stops. The six explicit artwork-position controls come before
  // the style group in the keyboard order.
  await page.locator('#artwork-stage').focus();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: 'Explore details' }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  const progress = page.getByRole('group', { name: 'Artwork navigation' });
  await expect(progress.getByRole('button').first()).toBeFocused();
  for (let index = 1; index <= 6; index += 1) {
    await page.keyboard.press('Tab');
  }
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

test('number keys select speaking styles across the gallery without moving focus', async ({
  page,
}) => {
  await page.goto('/');
  const gallery = page.locator('.gallery');
  const stage = page.locator('#artwork-stage');
  await stage.focus();

  await page.keyboard.press('4');
  await expect(gallery).toHaveAttribute('data-mode', 'story');
  await expect(stage).toBeFocused();
  await expect(
    gallery.getByRole('radio', { name: 'Story' }),
  ).toHaveAttribute('aria-keyshortcuts', '4');

  await page.getByRole('button', { name: 'Gallery settings' }).click();
  const dialog = page.getByRole('dialog');
  const heading = dialog.getByRole('heading', {
    level: 2,
    name: 'Gallery settings',
  });
  await expect(heading).toBeFocused();
  await page.keyboard.press('3');
  await expect(gallery).toHaveAttribute('data-mode', 'poetic');
  await expect(heading).toBeFocused();

  const fontFamily = dialog.getByRole('combobox', { name: 'Font family' });
  await fontFamily.focus();
  await page.keyboard.press('2');
  await expect(gallery).toHaveAttribute('data-mode', 'poetic');
  await expect(fontFamily).toBeFocused();
});

test('light mode keeps speaking-style accents distinct and artwork positions visible', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'light';
  });

  const gallery = page.locator('.gallery');
  const group = gallery.getByRole('radiogroup', { name: 'Speaking style' });
  const expectedAccents = [
    ['Literal', 'literal', '#74521c'],
    ['Spatial', 'spatial', '#2d6672'],
    ['Poetic', 'poetic', '#8f466f'],
    ['Story', 'story', '#95521f'],
    ['Curatorial', 'curatorial', '#376a4e'],
  ] as const;

  for (const [name, mode, accent] of expectedAccents) {
    await group.getByRole('radio', { name }).click();
    await expect(gallery).toHaveAttribute('data-mode', mode);
    expect(
      await gallery.evaluate((element) =>
        getComputedStyle(element).getPropertyValue('--gilt').trim(),
      ),
    ).toBe(accent);
  }

  const inactiveProgress = page
    .locator('.carousel-progress-bar:not([data-active="true"])')
    .first();
  expect(
    await inactiveProgress.evaluate(
      (element) => getComputedStyle(element, '::before').backgroundColor,
    ),
  ).toBe('rgba(21, 23, 27, 0.24)');
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

test('the complete artwork label remains visible below 320 CSS pixels', async ({
  page,
}) => {
  const viewport = { width: 280, height: 667 };
  await page.setViewportSize(viewport);
  await page.goto('/?artwork=hokusai-great-wave');
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Under the Wave off Kanagawa (The Great Wave)',
    }),
  ).toBeVisible();

  const geometry = await page.evaluate(() => {
    const rect = (selector: string) => {
      const bounds = document.querySelector(selector)!.getBoundingClientRect();
      return {
        left: bounds.left,
        right: bounds.right,
        bottom: bounds.bottom,
      };
    };

    return {
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      stage: rect('.stage-carousel'),
      label: rect('.artwork-label'),
      fineprint: rect('.artwork-fineprint'),
    };
  });

  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth);
  expect(geometry.stage.left).toBeGreaterThanOrEqual(-1);
  expect(geometry.stage.right).toBeLessThanOrEqual(viewport.width + 1);
  expect(geometry.label.left).toBeGreaterThanOrEqual(0);
  expect(geometry.label.right).toBeLessThanOrEqual(viewport.width);
  expect(geometry.fineprint.left).toBeGreaterThanOrEqual(0);
  expect(geometry.fineprint.right).toBeLessThanOrEqual(viewport.width);
  expect(geometry.label.bottom).toBeLessThanOrEqual(geometry.stage.bottom);
});

test('a localized largest-text label expands its carousel row', async ({
  page,
}) => {
  await page.setViewportSize({ width: 545, height: 844 });
  await page.goto('/?artwork=hokusai-great-wave');

  await page.getByRole('button', { name: 'Gallery settings' }).click();
  const dialog = page.getByRole('dialog');
  const preferences = dialog.locator('.preference-control select');
  await preferences.nth(1).selectOption('extra-large');
  await preferences.nth(4).selectOption('fr');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Sous la vague au large de Kanagawa (La Grande Vague)',
    }),
  ).toBeVisible();

  const geometry = await page.evaluate(() => {
    const bottom = (selector: string) =>
      document.querySelector(selector)!.getBoundingClientRect().bottom;
    const top = (selector: string) =>
      document.querySelector(selector)!.getBoundingClientRect().top;

    return {
      stageBottom: bottom('.stage-carousel'),
      labelBottom: bottom('.artwork-label'),
      progressTop: top('.carousel-progress'),
    };
  });

  expect(geometry.labelBottom).toBeLessThanOrEqual(geometry.stageBottom);
  expect(geometry.labelBottom).toBeLessThan(geometry.progressTop);
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

test('the first encounter offers ChatGPT guidance and keyboard-first authored details', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('.companion-panel')).toHaveCount(0);
  const guide = page.locator('.experience-guide');
  await expect(guide).toContainText('Ask ChatGPT');
  await guide.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(guide).toContainText('Describe this spatially.');
  await expect(guide.locator('textarea, input')).toHaveCount(0);

  const explore = page.getByRole('button', { name: 'Explore details' });
  await expect(explore).toBeVisible();
  await expect(explore).toHaveAttribute('aria-expanded', 'false');
  await explore.focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('button', { name: 'Hide details' }),
  ).toHaveAttribute('aria-expanded', 'true');

  const detail = page.getByRole('button', { name: 'The near winter tree' });
  await detail.focus();
  await page.keyboard.press('Enter');
  await expect(detail).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.region-focus-marker')).toHaveAttribute(
    'data-provenance',
    'authored',
  );
  await expect(page.getByText('Gallery-authored')).toBeVisible();

  const clear = page.getByRole('button', { name: 'Show whole artwork' });
  await clear.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.region-focus-marker')).toHaveCount(0);
  await expect(page.getByText('Gallery-authored')).toHaveCount(0);
});
