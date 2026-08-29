import { expect, test, type Page } from '@playwright/test';

interface BrowserToolResult {
  ok: boolean;
  action?: string;
  error?: { code: string; message: string };
  artworks?: Array<{ id: string }>;
  regions?: Array<{ id: string; provenance: string }>;
  context?: {
    observed: Array<{ id: string; text: string }>;
    known: Array<{ id: string; text: string; sourceIds: string[] }>;
  };
  activity?: Array<{
    origin: 'human' | 'agent';
    action: string;
    fromRevision: number;
    toRevision: number;
    summary: string;
  }>;
  changes?: Array<{ setting: string; from: string; to: string }>;
  state: {
    artwork: { id: string };
    mode: string;
    revision: number;
    collectionSize: number;
    hasInterpretation?: boolean;
    focusedRegion?: {
      id: string;
      provenance?: string;
      verification?: string;
    } | null;
  };
}

declare global {
  interface Window {
    companionMotionFrames: string[];
    galleryToolHarness: {
      names: () => string[];
      execute: (
        name: string,
        input: Record<string, unknown>,
      ) => Promise<BrowserToolResult>;
    };
  }
}

async function publishSimpleCompanion(page: Page) {
  const state = await page.evaluate(() =>
    window.galleryToolHarness.execute('get_gallery_state', {}),
  );
  return page.evaluate(
    ({ revision }) =>
      window.galleryToolHarness.execute('publish_gallery_response', {
        mode: 'literal',
        title: 'A responsive reading',
        expectedRevision: revision,
        segments: [
          { provenance: 'observed', statementId: 'pissarro-observed-1' },
          { provenance: 'known', statementId: 'pissarro-known-1' },
        ],
      }),
    { revision: state.state.revision },
  );
}

const registeredTools = [
  'get_gallery_state',
  'list_artworks',
  'get_artwork_context',
  'navigate_to_artwork',
  'set_experience_mode',
  'configure_presentation',
  'publish_gallery_response',
  'clear_gallery_response',
  'get_session_activity',
  'undo_last_change',
  'list_regions',
  'focus_artwork_area',
  'analyze_artwork_regions',
  'zoom_to_artwork_detail',
  'focus_region',
  'describe_region',
  'clear_region_focus',
] as const;

test.beforeEach(async ({ page }) => {
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
        if (!tool) throw new Error(`Missing browser tool: ${name}`);
        return tool.execute(input, {
          signal: new AbortController().signal,
        });
      },
    };
  });
});

test('the final tool surface drives navigation, regions, and localization', async ({
  page,
}) => {
  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => window.galleryToolHarness.names()))
    .toEqual(registeredTools);

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
  await expect(page.getByText('Gallery-authored')).toBeVisible();
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
  await expect(page).toHaveURL(/\?artwork=gifford-kauterskill-clove$/);
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'A Gorge in the Mountains (Kauterskill Clove)',
    }),
  ).toBeVisible();
  await expect.poll(() => page.locator('.stage-carousel > .artwork-figure').count()).toBe(1);
  await expect(page.locator('.gallery')).toHaveAttribute('data-mode', 'story');
  expect(navigation).toMatchObject({
    ok: true,
    state: {
      artwork: { id: 'gifford-kauterskill-clove' },
      mode: 'story',
      collectionSize: 6,
    },
  });
  expect(navigation.state.revision).toBeGreaterThan(0);

  await page.evaluate(() =>
    window.galleryToolHarness.execute('navigate_to_artwork', {
      artworkId: 'hokusai-great-wave',
    }),
  );
  await expect.poll(() => page.locator('.stage-carousel > .artwork-figure').count()).toBe(1);
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
  await expect(page.getByText('Agent-grounded suggestion')).toBeVisible();
  expect(agentFocus.state.focusedRegion).toMatchObject({
    provenance: 'agent-grounded',
    verification: 'unverified',
  });

  await page.getByRole('button', { name: 'Confirm this detail' }).click();
  await expect(
    page.getByText('Human-confirmed', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('.region-provenance')).toBeFocused();
  await expect(
    page.getByRole('button', { name: 'Confirm this detail' }),
  ).toHaveCount(0);

  await page.evaluate(() =>
    window.galleryToolHarness.execute('focus_artwork_area', {
      label: 'Foam beside the inscription',
      bounds: { x: 0.08, y: 0.08, width: 0.12, height: 0.18 },
    }),
  );
  const secondProposal = await page.locator('.artwork-canvas').getAttribute(
    'data-focused-region',
  );
  expect(secondProposal).toMatch(/agent-foam-beside-the-inscription-/);
  await page.getByRole('button', { name: 'Not this' }).click();
  await expect(page.locator('.artwork-canvas')).toHaveAttribute(
    'data-focused-region',
    '',
  );
  await expect(
    page.getByRole('button', { name: 'Explore details' }),
  ).toBeFocused();
  const afterDismissal = await page.evaluate(() =>
    window.galleryToolHarness.execute('list_regions', {}),
  );
  expect(afterDismissal.regions?.some(({ id }) => id === secondProposal)).toBe(
    false,
  );

  await page.evaluate(() =>
    window.galleryToolHarness.execute('configure_presentation', {
      fontFamily: 'mono',
      fontSize: 'extra-large',
      contrast: 'high',
      theme: 'light',
      language: 'es',
    }),
  );
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
  expect(await page.evaluate(() => window.galleryToolHarness.names())).toEqual(
    registeredTools,
  );
});

test('atomic adaptation and the provenance companion form a reversible shared journey', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => window.galleryToolHarness.names().length))
    .toBe(17);
  await expect(page.locator('.companion-panel')).toHaveCount(0);

  const initial = await page.evaluate(() =>
    window.galleryToolHarness.execute('get_gallery_state', {}),
  );
  const configured = await page.evaluate(
    ({ revision }) =>
      window.galleryToolHarness.execute('configure_presentation', {
        mode: 'spatial',
        fontFamily: 'serif',
        fontSize: 'large',
        contrast: 'high',
        theme: 'light',
        expectedRevision: revision,
      }),
    { revision: initial.state.revision },
  );
  expect(configured.ok).toBe(true);
  expect(configured.state.revision).toBe(initial.state.revision + 1);
  expect(configured.changes?.map(({ setting }) => setting)).toEqual([
    'mode',
    'fontFamily',
    'fontSize',
    'contrast',
    'theme',
  ]);
  await expect(page.locator('.gallery')).toHaveAttribute('data-mode', 'spatial');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  const beforeStale = await page.evaluate(() => ({
    mode: document.querySelector('.gallery')?.getAttribute('data-mode'),
    theme: document.documentElement.dataset.theme,
    title: document.querySelector('.artwork-label h2')?.textContent,
  }));
  const stale = await page.evaluate(
    ({ expectedRevision }) =>
      window.galleryToolHarness.execute('configure_presentation', {
        mode: 'poetic',
        theme: 'dark',
        expectedRevision,
      }),
    { expectedRevision: initial.state.revision },
  );
  expect(stale).toMatchObject({ ok: false, error: { code: 'STALE_GALLERY_STATE' } });
  expect(stale.state.revision).toBe(configured.state.revision);
  expect(
    await page.evaluate(() => ({
      mode: document.querySelector('.gallery')?.getAttribute('data-mode'),
      theme: document.documentElement.dataset.theme,
      title: document.querySelector('.artwork-label h2')?.textContent,
    })),
  ).toEqual(beforeStale);

  const context = await page.evaluate(() =>
    window.galleryToolHarness.execute('get_artwork_context', {}),
  );
  expect(context.context?.observed[0]?.id).toBe('pissarro-observed-1');
  expect(context.context?.known[0]?.sourceIds).toContain('met-object-437310');

  const unsafeLiteral = '<img src=x onerror="window.__companionPwned=true">';
  const published = await page.evaluate(
    ({ revision, unsafeLiteral }) =>
      window.galleryToolHarness.execute('publish_gallery_response', {
        mode: 'spatial',
        title: 'A shared reading',
        expectedRevision: revision,
        segments: [
          { provenance: 'observed', statementId: 'pissarro-observed-1' },
          { provenance: 'known', statementId: 'pissarro-known-1' },
          { provenance: 'interpreted', text: 'The avenue feels restless.' },
          { provenance: 'imagined', text: unsafeLiteral },
        ],
      }),
    { revision: configured.state.revision, unsafeLiteral },
  );
  expect(published.ok).toBe(true);
  expect(published.state.hasInterpretation).toBe(true);
  expect(published.state.revision).toBe(configured.state.revision + 1);

  const companion = page.getByRole('complementary', { name: 'A shared reading' });
  await expect(companion).toBeVisible();
  await expect(companion.locator('.companion-segment')).toHaveCount(4);
  for (const provenance of ['Observed', 'Known', 'Interpreted', 'Imagined']) {
    await expect(companion.getByText(provenance, { exact: true })).toBeVisible();
  }
  await expect(companion.getByText(unsafeLiteral, { exact: true })).toBeVisible();
  await expect(companion.locator('img')).toHaveCount(0);
  await expect(
    companion.getByRole('link', {
      name: 'The Metropolitan Museum of Art, object 437310',
    }),
  ).toHaveAttribute('href', 'https://www.metmuseum.org/art/collection/search/437310');
  expect(
    await page.evaluate(
      () => (window as unknown as { __companionPwned?: boolean }).__companionPwned,
    ),
  ).not.toBe(true);

  await expect(page.locator('.activity-receipt')).toHaveCount(0);
  await expect(page.getByText(/changed the gallery/i)).toHaveCount(0);
  const activity = await page.evaluate(() =>
    window.galleryToolHarness.execute('get_session_activity', {}),
  );
  expect(activity.activity?.at(-1)).toMatchObject({
    origin: 'agent',
    action: 'publish-gallery-response',
  });

  const cleared = await page.evaluate(
    ({ revision }) =>
      window.galleryToolHarness.execute('clear_gallery_response', {
        expectedRevision: revision,
      }),
    { revision: published.state.revision },
  );
  expect(cleared.ok).toBe(true);
  await expect(companion).toHaveCount(0);

  const undone = await page.evaluate(
    ({ revision }) =>
      window.galleryToolHarness.execute('undo_last_change', {
        expectedRevision: revision,
      }),
    { revision: cleared.state.revision },
  );
  expect(undone.ok).toBe(true);
  expect(undone.state.hasInterpretation).toBe(true);
  await expect(
    page.getByRole('complementary', { name: 'A shared reading' }),
  ).toBeVisible();
});

test('the companion composes beside desktop art and becomes a reduced-motion mobile overlay', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.companionMotionFrames = [];
    const nativeAnimate = Element.prototype.animate;
    Element.prototype.animate = function patchedAnimate(
      this: Element,
      ...args: Parameters<Element['animate']>
    ) {
      if (this.matches?.('.companion-panel')) {
        window.companionMotionFrames.push(JSON.stringify(args[0]));
      }
      return nativeAnimate.apply(this, args);
    };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect
    .poll(() => page.evaluate(() => window.galleryToolHarness.names().length))
    .toBe(17);
  await publishSimpleCompanion(page);

  const desktopCompanion = page.getByRole('complementary', {
    name: 'A responsive reading',
  });
  await expect(desktopCompanion).toBeVisible();
  await expect(page.locator('.hall')).toHaveAttribute('data-companion', 'true');
  await expect(desktopCompanion).toHaveCSS('position', 'static');
  const desktopGeometry = await page.evaluate(() => {
    const stage = document.querySelector('.stage-carousel')!.getBoundingClientRect();
    const companion = document.querySelector('.companion-panel')!.getBoundingClientRect();
    return {
      stageCentre: stage.left + stage.width / 2,
      companionCentre: companion.left + companion.width / 2,
    };
  });
  expect(desktopGeometry.companionCentre).toBeGreaterThan(
    desktopGeometry.stageCentre,
  );
  await expect(
    page.getByRole('link', { name: 'Skip to the shared companion' }),
  ).toHaveAttribute('href', '#companion-title');

  const close = desktopCompanion.getByRole('button', {
    name: 'Clear the shared response',
  });
  await close.focus();
  await expect(close).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(desktopCompanion).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => window.galleryToolHarness.names().length))
    .toBe(17);
  await publishSimpleCompanion(page);
  const mobileCompanion = page.getByRole('dialog', {
    name: 'A responsive reading',
  });
  await expect(mobileCompanion).toHaveCSS('position', 'fixed');
  await expect(
    mobileCompanion.getByRole('heading', { name: 'A responsive reading' }),
  ).toBeFocused();
  const mobilePanel = mobileCompanion.locator('.companion-panel');
  const mobileBox = await mobilePanel.boundingBox();
  expect(mobileBox).not.toBeNull();
  expect(mobileBox!.x).toBeGreaterThanOrEqual(0);
  expect(mobileBox!.x + mobileBox!.width).toBeLessThanOrEqual(390);
  expect(mobileBox!.y).toBeGreaterThanOrEqual(0);
  expect(mobileBox!.y + mobileBox!.height).toBeLessThanOrEqual(844);

  await expect
    .poll(() => page.evaluate(() => window.companionMotionFrames.length))
    .toBeGreaterThan(0);
  const motionFrames = await page.evaluate(() =>
    window.companionMotionFrames.join('\n'),
  );
  expect(motionFrames).not.toMatch(/translateX|translate3d|matrix/);

  await page.keyboard.press('Escape');
  await expect(mobileCompanion).toBeHidden();
  await expect(page.locator('#artwork-stage')).toBeFocused();
});
