import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { axe } from 'jest-axe';
import { afterEach, vi } from 'vitest';

import { App } from '../src/App';
import { modeDefinitions } from '../src/gallery/modes';
import { experienceModes } from '../src/gallery/reducer';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

function openSettings() {
  fireEvent.click(screen.getByRole('button', { name: 'Gallery settings' }));
  return screen.getByRole('dialog', { hidden: true });
}

function wallLabelGroup(): HTMLElement {
  const gallery = document.querySelector<HTMLElement>('.gallery');
  if (!gallery) {
    throw new Error('The gallery is not rendered.');
  }
  return within(gallery).getByRole('radiogroup', { name: 'Speaking style' });
}

function selectedStyle(group: HTMLElement): string | null {
  const selected = within(group)
    .getAllByRole('radio')
    .find((option) => option.getAttribute('aria-checked') === 'true');
  return selected?.textContent?.replace(/^\d/, '') ?? null;
}

function chooseStyle(group: HTMLElement, label: string) {
  fireEvent.click(within(group).getByRole('radio', { name: label }));
}

describe('accessible gallery', () => {
  it('has no detectable axe violations in the default encounter', async () => {
    const { container } = render(<App />);

    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no detectable axe violations with the settings modal open', async () => {
    const { container } = render(<App />);
    openSettings();

    expect((await axe(container)).violations).toEqual([]);
  });

  it('keeps the artwork visible and dominant with no error overlay', () => {
    render(<App />);

    const artwork = screen.getByRole('img', {
      name: /Elevated view down a wintry Paris boulevard/,
    });
    expect(artwork).toBeVisible();
    expect(artwork).toHaveAttribute(
      'src',
      '/artworks/pissarro-boulevard-montmartre.jpg',
    );
    expect(screen.queryByText('The image could not be displayed.')).toBeNull();
  });

  it('walks all six works forward and back through the History API', () => {
    render(<App />);

    const next = screen.getByRole('button', { name: /^Next artwork:/ });
    const expectedTitles = [
      'Young Woman with a Water Pitcher',
      'A Gorge in the Mountains (Kauterskill Clove)',
      'Wheat Field with Cypresses',
      'Under the Wave off Kanagawa (The Great Wave)',
      'The Dance Class',
      'The Boulevard Montmartre on a Winter Morning',
    ];

    expectedTitles.forEach((title, index) => {
      fireEvent.click(next);
      expect(
        screen.getByRole('heading', { level: 2, name: title }),
      ).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveTextContent(
        `Artwork ${((index + 1) % 6) + 1} of 6`,
      );
    });

    fireEvent.click(screen.getByRole('button', { name: /^Previous artwork:/ }));
    expect(
      screen.getByRole('heading', { level: 2, name: 'The Dance Class' }),
    ).toBeInTheDocument();
    expect(window.location.search).toBe('?artwork=degas-dance-class');
  });

  it('keeps the mode while navigating and synchronizes the artwork query', () => {
    render(<App />);

    chooseStyle(wallLabelGroup(), 'Poetic');
    fireEvent.click(screen.getByRole('button', { name: /^Next artwork:/ }));

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Young Woman with a Water Pitcher',
      }),
    ).toBeInTheDocument();
    expect(window.location.search).toBe(
      '?artwork=vermeer-woman-with-water-pitcher',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Mode: Poetic');
    expect(selectedStyle(wallLabelGroup())).toBe('Poetic');
  });

  it('responds to History API navigation through the shared state path', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /^Next artwork:/ }));

    window.history.pushState(null, '', '/?artwork=hokusai-great-wave');
    window.dispatchEvent(new PopStateEvent('popstate'));

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'Under the Wave off Kanagawa (The Great Wave)',
        }),
      ).toBeInTheDocument();
    });
  });

  it('honors a valid artwork deep link and ignores an invalid one', () => {
    window.history.replaceState(null, '', '/?artwork=vangogh-wheat-field-cypresses');
    const { unmount } = render(<App />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Wheat Field with Cypresses' }),
    ).toBeInTheDocument();

    unmount();
    window.history.replaceState(null, '', '/?artwork=missing');
    render(<App />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'The Boulevard Montmartre on a Winter Morning',
      }),
    ).toBeInTheDocument();
  });

  it('retains metadata and verified context when an image fails', () => {
    render(<App />);
    fireEvent.error(
      screen.getByRole('img', {
        name: /Elevated view down a wintry Paris boulevard/,
      }),
    );

    expect(
      screen.getByRole('img', {
        name: /Image unavailable: The Boulevard Montmartre/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The image could not be displayed.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/viewpoint is elevated above a broad boulevard/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'The Boulevard Montmartre on a Winter Morning',
      }),
    ).toBeInTheDocument();
  });
});

describe('Speaking style selector', () => {
  it('keeps the five speaking styles as radios beside native personalization controls', () => {
    const { container } = render(<App />);

    expect(container.querySelectorAll('select')).toHaveLength(0);
    expect(screen.queryAllByRole('combobox')).toHaveLength(0);
    expect(within(wallLabelGroup()).getAllByRole('radio')).toHaveLength(
      experienceModes.length,
    );

    openSettings();
    expect(container.querySelectorAll('select')).toHaveLength(5);
    expect(document.querySelectorAll('select')).toHaveLength(5);
  });

  it('changes the mode by choosing an option', () => {
    render(<App />);
    const group = wallLabelGroup();

    chooseStyle(group, 'Spatial');

    expect(selectedStyle(wallLabelGroup())).toBe('Spatial');
    expect(document.querySelector('.gallery')).toHaveAttribute(
      'data-mode',
      'spatial',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Mode: Spatial');
  });

  it('moves and selects with both arrow axes, wrapping at each end', () => {
    render(<App />);
    const group = wallLabelGroup();
    within(group).getByRole('radio', { name: 'Literal' }).focus();

    for (const [key, expected] of [
      ['ArrowRight', 'Spatial'],
      ['ArrowDown', 'Poetic'],
      ['ArrowLeft', 'Spatial'],
      ['ArrowUp', 'Literal'],
      // Wrapping: back past the first style lands on the last.
      ['ArrowLeft', 'Curatorial'],
      ['ArrowRight', 'Literal'],
    ] as const) {
      fireEvent.keyDown(document.activeElement!, { key });

      const current = wallLabelGroup();
      expect(selectedStyle(current)).toBe(expected);
      // Focus follows the selection, and the group stays one keyboard stop.
      expect(document.activeElement).toBe(
        within(current).getByRole('radio', { name: expected }),
      );
      expect(
        (document.activeElement as HTMLElement).tabIndex,
      ).toBe(0);
      expect(
        within(current)
          .getAllByRole('radio')
          .filter((option) => option.tabIndex === 0),
      ).toHaveLength(1);
    }
  });

  it('sends Home to Literal and End to Curatorial', () => {
    render(<App />);
    within(wallLabelGroup()).getByRole('radio', { name: 'Poetic' }).focus();

    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(selectedStyle(wallLabelGroup())).toBe('Curatorial');

    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(selectedStyle(wallLabelGroup())).toBe('Literal');
  });

  it('maps number keys 1 to 5 onto the indexed styles', () => {
    render(<App />);
    within(wallLabelGroup()).getByRole('radio', { name: 'Literal' }).focus();

    experienceModes.forEach((mode, index) => {
      fireEvent.keyDown(document.activeElement!, { key: String(index + 1) });

      expect(selectedStyle(wallLabelGroup())).toBe(modeDefinitions[mode].label);
      expect(document.querySelector('.gallery')).toHaveAttribute(
        'data-mode',
        mode,
      );
      expect(screen.getByRole('status')).toHaveTextContent(
        `Mode: ${modeDefinitions[mode].label}`,
      );
    });
  });

  it('selects the focused option on Space and Enter', () => {
    render(<App />);

    for (const key of [' ', 'Enter']) {
      const group = wallLabelGroup();
      within(group).getByRole('radio', { name: 'Literal' }).focus();
      // Move focus without a pointer, then confirm the focused option.
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
      fireEvent.keyDown(document.activeElement!, { key });

      expect(selectedStyle(wallLabelGroup())).toBe('Spatial');
      expect(document.querySelector('.gallery')).toHaveAttribute(
        'data-mode',
        'spatial',
      );

      fireEvent.keyDown(document.activeElement!, { key: '1' });
    }
  });

  it('ignores number keys outside the 1 to 5 range and modified presses', () => {
    render(<App />);
    const group = wallLabelGroup();
    chooseStyle(group, 'Poetic');

    for (const key of ['0', '6', '9', 'x', 'Tab']) {
      fireEvent.keyDown(document.activeElement!, { key });
      expect(selectedStyle(wallLabelGroup())).toBe('Poetic');
    }

    for (const modifier of ['metaKey', 'ctrlKey', 'altKey'] as const) {
      fireEvent.keyDown(document.activeElement!, {
        key: '1',
        [modifier]: true,
      });
      expect(selectedStyle(wallLabelGroup())).toBe('Poetic');
    }
    fireEvent.keyDown(document.activeElement!, {
      key: 'ArrowRight',
      metaKey: true,
    });
    expect(selectedStyle(wallLabelGroup())).toBe('Poetic');
  });

  it('keeps the wall-label and settings controls synchronized both ways', () => {
    render(<App />);

    chooseStyle(wallLabelGroup(), 'Curatorial');
    const dialog = openSettings();
    const modalGroup = within(dialog).getByRole('radiogroup', {
      name: 'Speaking style',
    });
    expect(selectedStyle(modalGroup)).toBe('Curatorial');

    within(modalGroup).getByRole('radio', { name: 'Curatorial' }).focus();
    fireEvent.keyDown(document.activeElement!, { key: '3' });

    expect(
      selectedStyle(
        within(dialog).getByRole('radiogroup', { name: 'Speaking style' }),
      ),
    ).toBe('Poetic');
    expect(selectedStyle(wallLabelGroup())).toBe('Poetic');
    expect(screen.getByRole('status')).toHaveTextContent('Mode: Poetic');
  });

  it('follows a WebMCP mode change in both places at once', () => {
    render(<App />);
    const dialog = openSettings();

    // The same controller path the set_experience_mode tool uses.
    const gallery = document.querySelector('.gallery');
    expect(gallery).not.toBeNull();

    chooseStyle(
      within(dialog).getByRole('radiogroup', { name: 'Speaking style' }),
      'Story',
    );

    expect(selectedStyle(wallLabelGroup())).toBe('Story');
    expect(gallery).toHaveAttribute('data-mode', 'story');
  });

  /* Reduced motion is a live media query, so it is asserted for real in
     tests/e2e/motion.spec.ts; here we prove Motion owns the moving pill. */
  it('animates the selected style with a Motion layout pill', () => {
    render(<App />);

    expect(
      document.querySelector('.style-select[data-motion="full"]'),
    ).not.toBeNull();

    const selected = within(wallLabelGroup()).getByRole('radio', {
      name: 'Literal',
    });
    expect(selected.querySelector('.style-select-pill')).not.toBeNull();

    chooseStyle(wallLabelGroup(), 'Story');

    // The pill is one element that moves, not one per option.
    expect(document.querySelectorAll('.style-select-pill')).toHaveLength(1);
    expect(
      within(wallLabelGroup())
        .getByRole('radio', { name: 'Story' })
        .querySelector('.style-select-pill'),
    ).not.toBeNull();
  });
});

describe('framed carousel', () => {
  it('keeps the peeks on the real neighbours as the collection turns', () => {
    render(<App />);

    /* Motion keeps the outgoing sliver mounted for its exit, so the
       neighbour is asserted as present rather than as the only one. */
    const peekSources = (side: 'previous' | 'next') =>
      [
        ...document.querySelectorAll(`.carousel-peek[data-side="${side}"] img`),
      ].map((image) => image.getAttribute('src'));

    expect(peekSources('previous')).toContain('/artworks/degas-dance-class.jpg');
    expect(peekSources('next')).toContain(
      '/artworks/vermeer-woman-with-water-pitcher.jpg',
    );

    fireEvent.click(screen.getByRole('button', { name: /^Next artwork:/ }));

    expect(peekSources('previous')).toContain(
      '/artworks/pissarro-boulevard-montmartre.jpg',
    );
    expect(peekSources('next')).toContain(
      '/artworks/gifford-kauterskill-clove.jpg',
    );

    /* Whatever is peeking in, every image the accessibility tree can see
       belongs to a work on the wall: the slivers add no second title. */
    for (const image of screen.getAllByRole('img')) {
      expect(image.closest('.artwork-figure')).not.toBeNull();
      expect(image).toHaveAccessibleName();
    }
    expect(
      document.querySelectorAll('.carousel-peek img[alt=""]').length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('advances the progress bars across all six works, in both directions', () => {
    render(<App />);

    const activeIndex = () =>
      [...document.querySelectorAll('.carousel-progress-bar')].findIndex(
        (bar) => bar.getAttribute('data-active') === 'true',
      );

    expect(activeIndex()).toBe(0);

    for (const expected of [1, 2, 3, 4, 5, 0]) {
      fireEvent.click(screen.getByRole('button', { name: /^Next artwork:/ }));
      expect(activeIndex()).toBe(expected);
      expect(
        document.querySelectorAll('.carousel-progress-bar[data-active="true"]'),
      ).toHaveLength(1);
    }

    fireEvent.click(screen.getByRole('button', { name: /^Previous artwork:/ }));
    expect(activeIndex()).toBe(5);
  });

  it('never advances on its own', async () => {
    vi.useFakeTimers();
    try {
      render(<App />);
      const title = screen.getByRole('heading', { level: 2 }).textContent;

      await vi.advanceTimersByTimeAsync(30_000);

      expect(screen.getByRole('heading', { level: 2 }).textContent).toBe(title);
      expect(screen.getByRole('status')).toHaveTextContent('Artwork 1 of 6');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('settings modal', () => {
  it('opens from the cog, owns the shared style select, and closes explicitly', async () => {
    render(<App />);
    const cog = screen.getByRole('button', { name: 'Gallery settings' });

    const dialog = openSettings();
    expect(cog).toHaveAttribute('aria-expanded', 'true');
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAccessibleName('Gallery settings');

    const modalGroup = within(dialog).getByRole('radiogroup', {
      name: 'Speaking style',
    });
    expect(within(modalGroup).getAllByRole('radio')).toHaveLength(
      experienceModes.length,
    );
    experienceModes.forEach((mode) => {
      const option = within(modalGroup).getByRole('radio', {
        name: modeDefinitions[mode].label,
      });
      expect(option).toBeEnabled();
      expect(option).toHaveAccessibleDescription(
        modeDefinitions[mode].description,
      );
    });
    // The settings copy explains the style it is on, in its own words.
    expect(
      within(dialog).getByText(modeDefinitions.literal.description, {
        selector: '.style-select-description',
      }),
    ).toBeInTheDocument();

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Close gallery settings' }),
    );
    expect(cog).toHaveAttribute('aria-expanded', 'false');

    // The native dialog stays open for the Motion exit, then closes and
    // hands focus back.
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    expect(document.activeElement).toBe(cog);
  });

  it('moves focus into the dialog and returns it to the cog on Escape', async () => {
    render(<App />);
    const cog = screen.getByRole('button', { name: 'Gallery settings' });
    const dialog = openSettings();

    expect(document.activeElement).toBe(
      within(dialog).getByRole('heading', { level: 2, name: 'Gallery settings' }),
    );

    fireEvent.keyDown(dialog, { key: 'Escape' });

    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    expect(document.activeElement).toBe(cog);
  });

  it('traps Tab inside the dialog and blocks the background', () => {
    const { container } = render(<App />);
    const dialog = openSettings();

    expect(container.querySelector('.gallery')).toHaveAttribute('inert');

    const focusable = [
      ...dialog.querySelectorAll<HTMLElement>(
        'button:not([tabindex="-1"]), a[href]',
      ),
    ];
    expect(focusable.length).toBeGreaterThan(3);

    const last = focusable[focusable.length - 1]!;
    last.focus();
    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(document.activeElement).toBe(focusable[0]);

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('animates the panel open with Motion', () => {
    render(<App />);
    openSettings();

    const panel = document.querySelector<HTMLElement>('.settings-panel');
    expect(panel).not.toBeNull();
    expect(document.querySelector('.settings-dialog')).toHaveAttribute(
      'data-motion',
      'full',
    );
    expect(panel!.style.transform).toContain('translateY');
  });

  it('changes the visible mode from inside the dialog', () => {
    render(<App />);
    const dialog = openSettings();

    fireEvent.click(
      within(
        within(dialog).getByRole('radiogroup', { name: 'Speaking style' }),
      ).getByRole('radio', { name: 'Curatorial' }),
    );

    expect(
      selectedStyle(
        within(dialog).getByRole('radiogroup', { name: 'Speaking style' }),
      ),
    ).toBe('Curatorial');
    expect(document.querySelector('.gallery')).toHaveAttribute(
      'data-mode',
      'curatorial',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Mode: Curatorial');
  });

  it('reports Site Tools honestly without claiming a validated voice session', () => {
    render(<App />);
    const dialog = openSettings();

    expect(
      within(dialog).getByText(/No Site Tools in this browser/),
    ).toBeInTheDocument();
    expect(within(dialog).queryByText(/voice validation passed/i)).toBeNull();
    expect(within(dialog).queryByText(/manual probe/i)).toBeNull();
  });
});
