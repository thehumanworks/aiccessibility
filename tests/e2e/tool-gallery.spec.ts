import { expect, test } from '@playwright/test';

interface BrowserToolResult {
  ok: boolean;
  artworks?: Array<{ id: string }>;
  state: {
    artwork: { id: string };
    mode: string;
    revision: number;
    collectionSize: number;
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
      revision: 2,
      collectionSize: 6,
    },
  });
  expect(await page.evaluate(() => window.galleryToolHarness.names())).toHaveLength(
    4,
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
    4,
  );
});

