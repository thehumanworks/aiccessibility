import { expect, test } from '@playwright/test';

interface BrowserToolResult {
  ok: boolean;
  artworks?: Array<{ id: string }>;
  regions?: Array<{ id: string; provenance: string }>;
  description?: { mode: string };
  state: {
    artwork: { id: string };
    mode: string;
    revision: number;
    collectionSize: number;
    focusedRegion?: { id: string } | null;
    availableRegionCount?: number;
  };
}

declare global {
  interface Window {
    galleryToolHarness: {
      names: () => string[];
      execute: (
        name: string,
        input: Record<string, unknown>,
      ) => Promise<BrowserToolResult>;
    };
  }
}

test('registered tools mutate the visible gallery and remain available', async ({
  page,
}) => {
  await page.addInitScript(() => {
    interface HarnessTool {
      name: string;
      execute: (
        input: Record<string, unknown>,
        options: { signal: AbortSignal },
      ) => BrowserToolResult | Promise<BrowserToolResult>;
    }

    const tools = new Map<string, HarnessTool>();
    const modelContext = {
      registerTool(
        tool: HarnessTool,
        options?: { signal?: AbortSignal },
      ): Promise<void> {
        tools.set(tool.name, tool);
        options?.signal?.addEventListener(
          'abort',
          () => tools.delete(tool.name),
          { once: true },
        );
        return Promise.resolve();
      },
    };

    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: modelContext,
    });
    window.galleryToolHarness = {
      names: () => [...tools.keys()],
      execute: async (name, input) => {
        const tool = tools.get(name);
        if (!tool) {
          throw new Error(`Missing browser tool: ${name}`);
        }
        return tool.execute(input, {
          signal: new AbortController().signal,
        });
      },
    };
  });

  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => window.galleryToolHarness.names()))
    .toEqual([
      'get_gallery_state',
      'list_artworks',
      'navigate_to_artwork',
      'set_experience_mode',
      'set_font_family',
      'set_font_size',
      'set_contrast',
      'set_color_theme',
      'set_content_language',
      'list_regions',
      'focus_artwork_area',
      'analyze_artwork_regions',
      'zoom_to_artwork_detail',
      'focus_region',
      'describe_region',
      'clear_region_focus',
    ]);

  const listing = await page.evaluate(() =>
    window.galleryToolHarness.execute('list_artworks', {}),
  );
  expect(listing.artworks?.map(({ id }) => id)).toEqual([
    'pissarro-boulevard-montmartre',
    'vermeer-woman-with-water-pitcher',
    'gifford-kauterskill-clove',
    'vangogh-wheat-field-cypresses',
    'hokusai-great-wave',
    'degas-dance-class',
  ]);

  const regions = await page.evaluate(() =>
    window.galleryToolHarness.execute('list_regions', {}),
  );
  expect(regions.regions).toHaveLength(3);
  expect(regions.regions?.every(({ provenance }) => provenance === 'authored')).toBe(
    true,
  );
  await expect(page.locator('.region-focus-marker')).toHaveCount(0);

  const focused = await page.evaluate(() =>
    window.galleryToolHarness.execute('focus_region', {
      regionId: 'pissarro-left-tree',
    }),
  );
  await expect(page.locator('.artwork-canvas')).toHaveAttribute(
    'data-focused-region',
    'pissarro-left-tree',
  );
  await expect(page.locator('.region-focus-marker')).toHaveCount(1);
  await expect(page.getByRole('status')).toContainText(
    'Focused on The near winter tree.',
  );
  expect(focused.state.focusedRegion?.id).toBe('pissarro-left-tree');

  await page.evaluate(() =>
    window.galleryToolHarness.execute('clear_region_focus', {}),
  );
  await expect(page.locator('.artwork-canvas')).toHaveAttribute(
    'data-focused-region',
    '',
  );

  await page.evaluate(() =>
    window.galleryToolHarness.execute('set_experience_mode', { mode: 'story' }),
  );
  const navigation = await page.evaluate(() =>
    window.galleryToolHarness.execute('navigate_to_artwork', {
      artworkId: 'gifford-kauterskill-clove',
    }),
  );

  // The tool call must be visible on the page the visitor is looking at.
  await expect(page).toHaveURL(/\?artwork=gifford-kauterskill-clove$/);
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'A Gorge in the Mountains (Kauterskill Clove)',
    }),
  ).toBeVisible();
  // The outgoing work leaves with the Motion carousel; one work remains.
  await expect
    .poll(() => page.locator('.stage-carousel > .artwork-figure').count())
    .toBe(1);
  await expect(page.locator('.artwork-image')).toHaveAttribute(
    'src',
    '/artworks/gifford-kauterskill-clove.jpg',
  );
  await expect(page.locator('.gallery')).toHaveAttribute('data-mode', 'story');
  await expect(page.getByRole('status')).toContainText('Mode: Story');
  await expect(
    page
      .locator('.gallery')
      .getByRole('radiogroup', { name: 'Speaking style' })
      .getByRole('radio', { name: 'Story' }),
  ).toHaveAttribute('aria-checked', 'true');
  expect(navigation).toMatchObject({
    ok: true,
    state: {
      artwork: { id: 'gifford-kauterskill-clove' },
      mode: 'story',
      revision: 4,
      collectionSize: 6,
    },
  });
  expect(await page.evaluate(() => window.galleryToolHarness.names())).toHaveLength(
    16,
  );

  // The settings copy of the shared select agrees with the tool result.
  await page.getByRole('button', { name: 'Gallery settings' }).click();
  const dialog = page.getByRole('dialog');
  await expect(
    dialog
      .getByRole('radiogroup', { name: 'Speaking style' })
      .getByRole('radio', { name: 'Story' }),
  ).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => window.galleryToolHarness.names())).toHaveLength(
    16,
  );

  await page.evaluate(() =>
    window.galleryToolHarness.execute('navigate_to_artwork', {
      artworkId: 'hokusai-great-wave',
    }),
  );
  await expect
    .poll(() => page.locator('.stage-carousel > .artwork-figure').count())
    .toBe(1);
  const agentFocus = await page.evaluate(() =>
    window.galleryToolHarness.execute('focus_artwork_area', {
      label: 'Japanese inscriptions',
      bounds: { x: 0.012, y: 0.05, width: 0.085, height: 0.26 },
    }),
  );
  await expect(page.locator('.artwork-canvas')).toHaveAttribute(
    'data-focused-region',
    /agent-japanese-inscriptions-/,
  );
  await expect(
    page.locator('[data-provenance="agent-grounded"]'),
  ).toBeVisible();
  expect(agentFocus.state.focusedRegion).toMatchObject({
    provenance: 'agent-grounded',
  });

  await page.evaluate(async () => {
    await window.galleryToolHarness.execute('set_font_family', {
      fontFamily: 'mono',
    });
    await window.galleryToolHarness.execute('set_font_size', {
      fontSize: 'extra-large',
    });
    await window.galleryToolHarness.execute('set_contrast', {
      contrast: 'high',
    });
    await window.galleryToolHarness.execute('set_color_theme', {
      theme: 'light',
    });
    await window.galleryToolHarness.execute('set_content_language', {
      language: 'es',
    });
  });

  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-font-family', 'mono');
  await expect(root).toHaveAttribute('data-font-size', 'extra-large');
  await expect(root).toHaveAttribute('data-contrast', 'high');
  await expect(root).toHaveAttribute('data-theme', 'light');
  await expect(root).toHaveAttribute('lang', 'es');
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Bajo la ola de Kanagawa (La gran ola)',
    }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ajustes de la galería' })).toBeVisible();
  expect(
    await page.evaluate(() => getComputedStyle(document.documentElement).fontSize),
  ).toBe('20px');
  expect(
    await page.evaluate(() => getComputedStyle(document.body).fontFamily),
  ).toContain('JetBrains Mono');
});

