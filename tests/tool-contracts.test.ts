import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { createElement } from 'react';
import { afterEach } from 'vitest';

import { App } from '../src/App';
import {
  createGalleryController,
  type GalleryController,
} from '../src/gallery/controller';
import {
  createInitialGalleryState,
  galleryReducer,
} from '../src/gallery/reducer';
import { registerGalleryTools, supportsWebMcp } from '../src/webmcp/register';
import { createGalleryTools } from '../src/webmcp/tools';

interface SuccessResult {
  ok: true;
  action: string;
  state: {
    artwork: { id: string; title: string };
    mode: string;
    revision: number;
    collectionSize: number;
  };
  artworks?: Array<{ id: string }>;
}

interface ErrorResult {
  ok: false;
  error: {
    code: string;
    recovery: Record<string, unknown>;
  };
  state: { revision: number };
}

class FakeModelContext extends EventTarget implements WebMCP.ModelContext {
  readonly tools: WebMCP.ModelContextTool[] = [];

  async registerTool(
    tool: WebMCP.ModelContextTool,
    options?: WebMCP.ModelContextRegisterToolOptions,
  ): Promise<void> {
    this.tools.push(tool);
    options?.signal?.addEventListener(
      'abort',
      () => {
        const index = this.tools.indexOf(tool);
        if (index >= 0) {
          this.tools.splice(index, 1);
        }
      },
      { once: true },
    );
  }
}

function createTestController(): GalleryController {
  let state = createInitialGalleryState();
  return createGalleryController({
    getState: () => state,
    applyAction: (action) => {
      state = galleryReducer(state, action);
      return state;
    },
  });
}

function findTool(
  tools: readonly WebMCP.ModelContextTool[],
  name: string,
): WebMCP.ModelContextTool {
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool) {
    throw new Error(`Missing test tool: ${name}`);
  }
  return tool;
}

function executionOptions(signal = new AbortController().signal) {
  return { signal };
}

afterEach(() => {
  window.history.replaceState(null, '', '/');
  Reflect.deleteProperty(document, 'modelContext');
});

describe('WebMCP probe contracts', () => {
  it('detects support and registers exactly four top-level tools with cleanup', async () => {
    const modelContext = new FakeModelContext();
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: modelContext,
    });

    expect(supportsWebMcp()).toBe(true);
    const registration = registerGalleryTools(createTestController());
    expect(registration.supported).toBe(true);
    expect(await registration.ready).toBe(true);
    expect(modelContext.tools.map(({ name }) => name)).toEqual([
      'get_gallery_state',
      'list_artworks',
      'navigate_to_artwork',
      'set_experience_mode',
    ]);

    registration.unregister();
    expect(modelContext.tools).toEqual([]);
  });

  it('uses closed schemas and accurate read/write annotations', () => {
    const tools = createGalleryTools(createTestController());

    for (const tool of tools) {
      expect(tool.inputSchema).toMatchObject({
        type: 'object',
        additionalProperties: false,
      });
    }
    expect(
      findTool(tools, 'get_gallery_state').annotations?.readOnlyHint,
    ).toBe(true);
    expect(findTool(tools, 'list_artworks').annotations?.readOnlyHint).toBe(
      true,
    );
    expect(
      findTool(tools, 'navigate_to_artwork').annotations?.readOnlyHint,
    ).toBe(false);
    expect(
      findTool(tools, 'set_experience_mode').annotations?.readOnlyHint,
    ).toBe(false);
  });

  it('keeps revision unchanged for both read-only tools', async () => {
    const controller = createTestController();
    const tools = createGalleryTools(controller);
    const before = controller.getState();

    const stateResult = (await findTool(tools, 'get_gallery_state').execute(
      {},
      executionOptions(),
    )) as SuccessResult;
    const listResult = (await findTool(tools, 'list_artworks').execute(
      { excludeCurrent: true },
      executionOptions(),
    )) as SuccessResult;

    expect(stateResult.ok).toBe(true);
    expect(stateResult.state.revision).toBe(0);
    expect(listResult.artworks?.map(({ id }) => id)).toEqual([
      'vermeer-woman-with-water-pitcher',
      'gifford-kauterskill-clove',
      'vangogh-wheat-field-cypresses',
      'hokusai-great-wave',
      'degas-dance-class',
    ]);
    expect(stateResult.state.collectionSize).toBe(6);
    expect(listResult.state.revision).toBe(0);
    expect(controller.getState()).toBe(before);
  });

  it('returns recoverable errors and never changes state for invalid calls', async () => {
    const controller = createTestController();
    const tools = createGalleryTools(controller);
    const before = controller.getState();

    const unknownArtwork = (await findTool(
      tools,
      'navigate_to_artwork',
    ).execute(
      { artworkId: 'missing-artwork' },
      executionOptions(),
    )) as ErrorResult;
    const unknownMode = (await findTool(tools, 'set_experience_mode').execute(
      { mode: 'chaos' },
      executionOptions(),
    )) as ErrorResult;
    const extraProperty = (await findTool(tools, 'get_gallery_state').execute(
      { surprise: true },
      executionOptions(),
    )) as ErrorResult;

    expect(unknownArtwork).toMatchObject({
      ok: false,
      error: {
        code: 'UNKNOWN_ARTWORK',
        recovery: { validArtworks: expect.any(Array) },
      },
    });
    expect(unknownMode).toMatchObject({
      ok: false,
      error: {
        code: 'UNKNOWN_MODE',
        recovery: { validModes: expect.any(Array) },
      },
    });
    expect(extraProperty.error.code).toBe('INVALID_INPUT');
    expect(controller.getState()).toBe(before);
    expect(controller.getState().revision).toBe(0);
  });

  it('does not apply a mutation after execution has already been cancelled', async () => {
    const controller = createTestController();
    const tool = findTool(createGalleryTools(controller), 'navigate_to_artwork');
    const cancellation = new AbortController();
    cancellation.abort();

    const result = (await tool.execute(
      { artworkId: 'hokusai-great-wave' },
      executionOptions(cancellation.signal),
    )) as ErrorResult;

    expect(result.error.code).toBe('EXECUTION_CANCELLED');
    expect(controller.getState()).toEqual(createInitialGalleryState());
    expect(window.location.search).toBe('');
  });

  it('applies mutations when the runtime omits callback options', async () => {
    const controller = createTestController();
    const tools = createGalleryTools(controller);

    const modeResult = (await findTool(
      tools,
      'set_experience_mode',
    ).execute({ mode: 'poetic' })) as SuccessResult;
    const navigationResult = (await findTool(
      tools,
      'navigate_to_artwork',
    ).execute({ artworkId: 'hokusai-great-wave' })) as SuccessResult;

    expect(modeResult).toMatchObject({
      ok: true,
      state: { mode: 'poetic', revision: 1 },
    });
    expect(navigationResult).toMatchObject({
      ok: true,
      state: {
        artwork: { id: 'hokusai-great-wave' },
        mode: 'poetic',
        revision: 2,
      },
    });
    expect(controller.getState()).toMatchObject({
      artworkId: 'hokusai-great-wave',
      mode: 'poetic',
      revision: 2,
    });
  });

  it('routes tool mutations through the live App controller without losing tools', async () => {
    const modelContext = new FakeModelContext();
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: modelContext,
    });

    const { unmount } = render(createElement(App));
    await waitFor(() => expect(modelContext.tools).toHaveLength(4));

    await act(async () => {
      await findTool(modelContext.tools, 'set_experience_mode').execute(
        { mode: 'story' },
        executionOptions(),
      );
      await findTool(modelContext.tools, 'navigate_to_artwork').execute(
        { artworkId: 'hokusai-great-wave' },
        executionOptions(),
      );
    });

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Under the Wave off Kanagawa (The Great Wave)',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Mode: Story');
    expect(document.querySelector('.gallery')).toHaveAttribute(
      'data-mode',
      'story',
    );
    expect(window.location.search).toBe('?artwork=hokusai-great-wave');
    expect(modelContext.tools).toHaveLength(4);

    // The tool-set mode is the chosen option of the wall-label control.
    const checkedStyle = (group: HTMLElement) =>
      within(group)
        .getAllByRole('radio')
        .find((option) => option.getAttribute('aria-checked') === 'true')
        ?.textContent;

    const wallLabelGroup = within(
      document.querySelector<HTMLElement>('.gallery')!,
    ).getByRole('radiogroup', { name: 'Speaking style' });
    expect(checkedStyle(wallLabelGroup)).toBe('4Story');

    // ...and the settings copy of the same control agrees with it.
    fireEvent.click(screen.getByRole('button', { name: 'Gallery settings' }));
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(
      checkedStyle(
        within(dialog).getByRole('radiogroup', { name: 'Speaking style' }),
      ),
    ).toBe('4Story');
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Close gallery settings' }),
    );

    unmount();
    expect(modelContext.tools).toHaveLength(0);
  });

  it('leaves the manual gallery available when WebMCP is unsupported', async () => {
    expect(supportsWebMcp()).toBe(false);
    const registration = registerGalleryTools(createTestController());
    expect(registration.supported).toBe(false);
    expect(await registration.ready).toBe(false);
    expect(() => registration.unregister()).not.toThrow();
  });
});
