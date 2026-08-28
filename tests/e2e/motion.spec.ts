import { expect, test, type Page } from '@playwright/test';

interface MotionRecorder {
  animations: Record<string, number>;
  styleWrites: Record<string, number>;
  maxFiguresOnStage: number;
  lastEscapeAt: number | null;
  dialogClosedAt: number | null;
  count: (selector: string) => number;
  writes: (selector: string) => number;
  reset: () => void;
}

declare global {
  interface Window {
    motionRecorder: MotionRecorder;
  }
}

/* Motion animates through the Web Animations API, so recording every
   element.animate() call proves a transition really ran, without racing it. */
async function installRecorder(page: Page) {
  await page.addInitScript(() => {
    const tracked = [
      '.artwork-figure',
      '.settings-panel',
      '.mode-atmosphere',
      '.carousel-peek-image',
    ];

    /* Motion's layout animations are driven by projection, which writes
       `transform` inline every frame instead of calling element.animate(). */
    const trackedWrites = ['.style-select-pill', '.carousel-progress-fill'];

    const recorder: MotionRecorder = {
      animations: {},
      styleWrites: {},
      maxFiguresOnStage: 0,
      lastEscapeAt: null,
      dialogClosedAt: null,
      count: (selector) => recorder.animations[selector] ?? 0,
      writes: (selector) => recorder.styleWrites[selector] ?? 0,
      reset() {
        recorder.animations = {};
        recorder.styleWrites = {};
        recorder.maxFiguresOnStage = 0;
        recorder.lastEscapeAt = null;
        recorder.dialogClosedAt = null;
      },
    };
    window.motionRecorder = recorder;

    const nativeAnimate = Element.prototype.animate;
    Element.prototype.animate = function patchedAnimate(
      this: Element,
      ...args: Parameters<Element['animate']>
    ) {
      for (const selector of tracked) {
        if (this.matches?.(selector)) {
          recorder.animations[selector] =
            (recorder.animations[selector] ?? 0) + 1;
        }
      }
      return nativeAnimate.apply(this, args);
    };

    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape') {
          recorder.lastEscapeAt = performance.now();
        }
      },
      true,
    );

    const observe = () => {
      new MutationObserver((records) => {
        for (const record of records) {
          const target = record.target;
          if (record.attributeName === 'style' && target instanceof Element) {
            for (const selector of trackedWrites) {
              if (target.matches(selector)) {
                recorder.styleWrites[selector] =
                  (recorder.styleWrites[selector] ?? 0) + 1;
              }
            }
          }
          if (
            target instanceof HTMLDialogElement &&
            record.attributeName === 'open' &&
            !target.open
          ) {
            recorder.dialogClosedAt = performance.now();
          }
        }

        recorder.maxFiguresOnStage = Math.max(
          recorder.maxFiguresOnStage,
          document.querySelectorAll('.stage-carousel > .artwork-figure').length,
        );
      }).observe(document.body, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['style', 'open'],
      });
    };

    if (document.body) {
      observe();
    } else {
      document.addEventListener('DOMContentLoaded', observe, { once: true });
    }
  });
}

test('settings fills the whole viewport on desktop and on mobile', async ({
  page,
}) => {
  await page.goto('/');

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.getByRole('button', { name: 'Gallery settings' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    const panel = page.locator('.settings-panel');
    // Measure the room once Motion has settled it, not mid-entrance.
    await expect(panel).toHaveCSS('transform', 'none');
    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeLessThanOrEqual(1);
    expect(box!.y).toBeLessThanOrEqual(1);
    expect(box!.width).toBeGreaterThanOrEqual(viewport.width - 1);
    expect(box!.height).toBeGreaterThanOrEqual(viewport.height - 1);

    // Full viewport, still borderless: no card sitting inside the room.
    await expect(page.locator('.settings-panel aside')).toHaveCount(0);
    await expect(panel).toHaveCSS('border-top-width', '0px');
    await expect(panel).toHaveCSS('box-shadow', 'none');

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  }
});

test('the settings dialog stays open for its Motion exit, then returns focus', async ({
  page,
}) => {
  await installRecorder(page);
  await page.goto('/');

  const cog = page.getByRole('button', { name: 'Gallery settings' });
  await cog.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Opening is animated: Motion runs a real animation on the panel.
  await expect
    .poll(() =>
      page.evaluate(() => window.motionRecorder.count('.settings-panel')),
    )
    .toBeGreaterThan(0);
  await expect(page.locator('.settings-dialog')).toHaveAttribute(
    'data-motion',
    'full',
  );

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(cog).toBeFocused();

  const { lastEscapeAt, dialogClosedAt } = await page.evaluate(() => ({
    lastEscapeAt: window.motionRecorder.lastEscapeAt,
    dialogClosedAt: window.motionRecorder.dialogClosedAt,
  }));
  expect(lastEscapeAt).not.toBeNull();
  expect(dialogClosedAt).not.toBeNull();
  // The native dialog outlived the exit animation rather than snapping shut.
  expect(dialogClosedAt! - lastEscapeAt!).toBeGreaterThan(120);
});

test('reduced motion collapses the settings and style animations', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  await expect(page.locator('.style-select')).toHaveAttribute(
    'data-motion',
    'reduced',
  );

  const cog = page.getByRole('button', { name: 'Gallery settings' });
  await cog.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('.settings-dialog')).toHaveAttribute(
    'data-motion',
    'reduced',
  );
  // No travel: Motion's reduced-motion support leaves only the opacity change.
  await expect(page.locator('.settings-panel')).toHaveCSS(
    'transform',
    'none',
  );

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(cog).toBeFocused();

  await page
    .locator('.gallery')
    .getByRole('radiogroup', { name: 'Speaking style' })
    .getByRole('radio', { name: 'Poetic' })
    .click();
  await expect(page.locator('.gallery')).toHaveAttribute('data-mode', 'poetic');
  // The pill is simply where the chosen style is: no layout travel.
  await expect(page.locator('.style-select-pill').first()).toHaveCSS(
    'transform',
    'none',
  );
  await expect(page.locator('.artwork-figure')).toHaveCSS('transform', 'none');
});

test('the Speaking style pill travels with a Motion layout animation', async ({
  page,
}) => {
  await installRecorder(page);
  await page.goto('/');
  await expect(page.locator('.artwork-image')).toBeVisible();

  const group = page
    .locator('.gallery')
    .getByRole('radiogroup', { name: 'Speaking style' });
  const pill = page.locator('.style-select-pill').first();

  const before = await pill.boundingBox();
  await page.evaluate(() => window.motionRecorder.reset());

  await group.getByRole('radio', { name: 'Curatorial' }).click();
  // Caught in flight: the pill is being projected, not already placed.
  expect(
    await pill.evaluate((element) => getComputedStyle(element).transform),
  ).not.toBe('none');
  await expect(group.getByRole('radio', { name: 'Curatorial' })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  // Motion projects the pill frame by frame from one style to the next.
  await expect
    .poll(() =>
      page.evaluate(() => window.motionRecorder.writes('.style-select-pill')),
    )
    .toBeGreaterThan(1);

  await expect(pill).toHaveCSS('transform', 'none');
  const after = await pill.boundingBox();
  expect(after!.x).toBeGreaterThan(before!.x + 40);

  // One pill, wherever it has arrived.
  await expect(page.locator('.gallery .style-select-pill')).toHaveCount(1);
});

test('reduced motion collapses the style pill to an instant move', async ({
  page,
}) => {
  await installRecorder(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.artwork-image')).toBeVisible();
  await page.evaluate(() => window.motionRecorder.reset());

  const group = page
    .locator('.gallery')
    .getByRole('radiogroup', { name: 'Speaking style' });
  const curatorial = group.getByRole('radio', { name: 'Curatorial' });
  await curatorial.click();

  /* The choice is still unmistakable: no travel to sit through, the pill is
     simply already under the chosen style. */
  const pill = page.locator('.style-select-pill').first();
  expect(
    await pill.evaluate((element) => getComputedStyle(element).transform),
  ).toBe('none');
  await expect(curatorial).toHaveAttribute('aria-checked', 'true');

  const pillBox = await pill.boundingBox();
  const optionBox = await curatorial.boundingBox();
  expect(Math.abs(pillBox!.x - optionBox!.x)).toBeLessThan(2);
  expect(Math.abs(pillBox!.width - optionBox!.width)).toBeLessThan(2);
});

test('the room shows slivers of the works either side, hidden from the reading order', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('.artwork-image')).toBeVisible();

  const previous = page.locator('.carousel-peek[data-side="previous"]');
  const next = page.locator('.carousel-peek[data-side="next"]');
  await expect(previous).toBeVisible();
  await expect(next).toBeVisible();

  // Real neighbouring works, not decoration.
  await expect(previous.locator('img')).toHaveAttribute(
    'src',
    '/artworks/degas-dance-class.jpg',
  );
  await expect(next.locator('img')).toHaveAttribute(
    'src',
    '/artworks/vermeer-woman-with-water-pitcher.jpg',
  );

  // Blurred, dimmed, and masked: never a second painting competing.
  for (const peek of [previous, next]) {
    await expect(peek).toHaveAttribute('aria-hidden', 'true');
    const image = peek.locator('img');
    await expect(image).toHaveAttribute('alt', '');
    const style = await image.evaluate((element) => {
      const computed = getComputedStyle(element);
      const parent = getComputedStyle(element.parentElement!);
      return {
        filter: computed.filter,
        maskImage: computed.maskImage,
        peekOpacity: Number.parseFloat(parent.opacity),
      };
    });
    expect(style.filter).toContain('blur');
    expect(style.maskImage).not.toBe('none');
    expect(style.peekOpacity).toBeLessThan(0.7);
  }

  // Not in the accessibility tree, not in the keyboard path.
  expect(
    await page.getByRole('img').evaluateAll((images) =>
      images.every((image) => image.closest('.artwork-figure') !== null),
    ),
  ).toBe(true);
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Young Woman with a Water Pitcher',
    }),
  ).toHaveCount(0);

  // The whole carousel stays inside the room.
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    ),
  ).toBeLessThanOrEqual(1);
});

test('the peeks travel with the work and follow the new neighbours', async ({
  page,
}) => {
  await installRecorder(page);
  await page.goto('/');
  await expect(page.locator('.artwork-image')).toBeVisible();
  await page.evaluate(() => window.motionRecorder.reset());

  await page.getByRole('button', { name: /^Next artwork:/ }).click();
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Young Woman with a Water Pitcher',
    }),
  ).toBeVisible();

  // The slivers are part of the same animated track as the framed work.
  await expect
    .poll(() =>
      page.evaluate(() => window.motionRecorder.count('.carousel-peek-image')),
    )
    .toBeGreaterThanOrEqual(2);

  await expect
    .poll(() => page.locator('.carousel-peek[data-side="next"] img').count())
    .toBe(1);
  await expect(
    page.locator('.carousel-peek[data-side="previous"] img'),
  ).toHaveAttribute('src', '/artworks/pissarro-boulevard-montmartre.jpg');
  await expect(
    page.locator('.carousel-peek[data-side="next"] img'),
  ).toHaveAttribute('src', '/artworks/gifford-kauterskill-clove.jpg');
});

test('six fine bars follow the collection, and nothing advances on its own', async ({
  page,
}) => {
  await installRecorder(page);
  await page.goto('/');
  await expect(page.locator('.artwork-image')).toBeVisible();

  const bars = page.locator('.carousel-progress-bar');
  await expect(bars).toHaveCount(6);
  await expect(page.locator('.carousel-progress')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(page.locator('.carousel-progress-fill')).toHaveCount(1);

  const activeIndex = () =>
    bars.evaluateAll((elements) =>
      elements.findIndex(
        (element) => element.getAttribute('data-active') === 'true',
      ),
    );
  expect(await activeIndex()).toBe(0);

  await page.evaluate(() => window.motionRecorder.reset());
  for (const expected of [1, 2, 3, 4, 5, 0]) {
    await page.getByRole('button', { name: /^Next artwork:/ }).click();
    await expect
      .poll(activeIndex)
      .toBe(expected);
  }

  // The fill is carried between bars by Motion, not redrawn in place.
  expect(
    await page.evaluate(() =>
      window.motionRecorder.writes('.carousel-progress-fill'),
    ),
  ).toBeGreaterThan(1);

  // No autoplay: two contemplative seconds change nothing.
  const before = await page.getByRole('status').textContent();
  await page.waitForTimeout(2000);
  expect(await activeIndex()).toBe(0);
  expect(await page.getByRole('status').textContent()).toBe(before);
});

test('previous and next move the painting, frame, and wall label as one', async ({
  page,
}) => {
  await installRecorder(page);
  await page.goto('/');
  await expect(page.locator('.artwork-image')).toBeVisible();
  await page.evaluate(() => window.motionRecorder.reset());

  await page.getByRole('button', { name: /^Next artwork:/ }).click();
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Young Woman with a Water Pitcher',
    }),
  ).toBeVisible();

  // Both works share the one stage cell while the encounter changes hands,
  // and both are animated: the outgoing exit and the incoming entrance.
  await expect
    .poll(() =>
      page.evaluate(() => window.motionRecorder.count('.artwork-figure')),
    )
    .toBeGreaterThanOrEqual(2);
  expect(
    await page.evaluate(() => window.motionRecorder.maxFiguresOnStage),
  ).toBe(2);

  // The label travels inside the same animated figure, never separately.
  await expect(
    page.locator('.artwork-figure').first().locator('.artwork-label'),
  ).toBeVisible();

  await expect
    .poll(() => page.locator('.stage-carousel > .artwork-figure').count())
    .toBe(1);
  await expect(page.locator('.artwork-figure')).toHaveCSS('transform', 'none');

  await page.evaluate(() => window.motionRecorder.reset());
  await page.getByRole('button', { name: /^Previous artwork:/ }).click();
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'The Boulevard Montmartre on a Winter Morning',
    }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => window.motionRecorder.count('.artwork-figure')),
    )
    .toBeGreaterThanOrEqual(2);
});

test('a WebMCP navigation animates the same carousel as the arrows', async ({
  page,
}) => {
  await installRecorder(page);
  await page.addInitScript(() => {
    interface HarnessTool {
      name: string;
      execute: (
        input: Record<string, unknown>,
        options: { signal: AbortSignal },
      ) => unknown;
    }

    const tools = new Map<string, HarnessTool>();
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: {
        registerTool(tool: HarnessTool) {
          tools.set(tool.name, tool);
          return Promise.resolve();
        },
      },
    });
    Object.defineProperty(window, 'callGalleryTool', {
      configurable: true,
      value: (name: string, input: Record<string, unknown>) =>
        tools
          .get(name)!
          .execute(input, { signal: new AbortController().signal }),
    });
  });

  await page.goto('/');
  await expect(page.locator('.artwork-image')).toBeVisible();
  await page.evaluate(() => window.motionRecorder.reset());

  await page.evaluate(() =>
    (
      window as unknown as {
        callGalleryTool: (name: string, input: unknown) => unknown;
      }
    ).callGalleryTool('navigate_to_artwork', {
      artworkId: 'hokusai-great-wave',
    }),
  );

  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Under the Wave off Kanagawa (The Great Wave)',
    }),
  ).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(() => window.motionRecorder.count('.artwork-figure')),
    )
    .toBeGreaterThanOrEqual(2);
  expect(
    await page.evaluate(() => window.motionRecorder.maxFiguresOnStage),
  ).toBe(2);

  // History and the wall label survive the animated tool navigation.
  await expect(page).toHaveURL(/\?artwork=hokusai-great-wave$/);
  await expect(page.getByRole('status')).toContainText('Artwork 5 of 6');
  await expect
    .poll(() => page.locator('.stage-carousel > .artwork-figure').count())
    .toBe(1);

  await page.evaluate(() =>
    (
      window as unknown as {
        callGalleryTool: (name: string, input: unknown) => unknown;
      }
    ).callGalleryTool('set_experience_mode', { mode: 'curatorial' }),
  );
  await expect(
    page
      .locator('.gallery')
      .getByRole('radiogroup', { name: 'Speaking style' })
      .getByRole('radio', { name: 'Curatorial' }),
  ).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('.gallery')).toHaveAttribute(
    'data-mode',
    'curatorial',
  );
  // The settings copy of the control moved with it, without being opened.
  await page.getByRole('button', { name: 'Gallery settings' }).click();
  await expect(
    page
      .getByRole('dialog')
      .getByRole('radiogroup', { name: 'Speaking style' })
      .getByRole('radio', { name: 'Curatorial' }),
  ).toHaveAttribute('aria-checked', 'true');
});
