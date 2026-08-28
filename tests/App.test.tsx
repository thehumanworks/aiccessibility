import { fireEvent, render, screen, within } from '@testing-library/react';

import { App } from '../src/App';

describe('AIccessibility gallery shell', () => {
  it('makes one artwork the page, with an understated wordmark', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'AIccessibility' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'The Boulevard Montmartre on a Winter Morning',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: /Elevated view down a wintry Paris boulevard/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Camille Pissarro', { exact: false })).toBeVisible();
  });

  it('keeps navigation discreet and free of boxed chrome', () => {
    const { container } = render(<App />);

    expect(
      screen.getByRole('navigation', { name: 'Artwork navigation' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Previous artwork:/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /^Next artwork:/ }),
    ).toBeInTheDocument();

    // No persistent panels, cards, or settings blocks in the page flow.
    expect(container.querySelector('aside')).toBeNull();
    expect(container.querySelector('fieldset')).toBeNull();
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('exposes settings only through one compact cog button', () => {
    render(<App />);

    const cog = screen.getByRole('button', { name: 'Gallery settings' });
    expect(cog).toHaveAttribute('aria-haspopup', 'dialog');
    expect(cog).toHaveAttribute('aria-expanded', 'false');

    for (const mode of ['Literal', 'Spatial', 'Poetic', 'Story', 'Curatorial']) {
      expect(screen.queryByRole('button', { name: mode })).toBeNull();
    }
  });

  it('offers the Speaking style control in the wall-label area itself', () => {
    const { container } = render(<App />);

    const group = screen.getByRole('radiogroup', { name: 'Speaking style' });
    expect(group).toBeVisible();

    // Nothing on the page hands the operating system a popup to draw.
    expect(container.querySelector('select')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('listbox')).toBeNull();

    // The carousel is the artwork; the control sits beside it, not inside it.
    expect(group.closest('.artwork-figure')).toBeNull();
    expect(group.closest('.hall')).not.toBeNull();
  });

  it('numbers all five speaking styles from 1 to 5 in one keyboard stop', () => {
    render(<App />);

    const group = screen.getByRole('radiogroup', { name: 'Speaking style' });
    const options = within(group).getAllByRole('radio');

    expect(options.map((option) => option.textContent)).toEqual([
      '1Literal',
      '2Spatial',
      '3Poetic',
      '4Story',
      '5Curatorial',
    ]);
    // The digits are shown but never spoken: each option is named by its style.
    expect(options.map((option) => option.getAttribute('aria-label'))).toEqual([
      null,
      null,
      null,
      null,
      null,
    ]);
    expect(
      options.map((option) => option.getAttribute('aria-checked')),
    ).toEqual(['true', 'false', 'false', 'false', 'false']);
    // Roving tabIndex: the group is one stop, whatever is selected.
    expect(options.map((option) => option.tabIndex)).toEqual([0, -1, -1, -1, -1]);

    expect(group).toHaveAccessibleDescription(
      'Arrow keys move through the five styles. Number keys 1 to 5 choose one directly.',
    );
    expect(
      within(group).getByRole('radio', { name: 'Literal' }),
    ).toHaveAccessibleDescription(
      'Concrete visual detail, without invented meaning.',
    );
  });

  it('frames the collection with peeks of the neighbouring works', () => {
    const { container } = render(<App />);

    const peeks = container.querySelectorAll('.carousel-peek');
    expect(peeks).toHaveLength(2);

    // Real neighbours: the last work to the left, the second to the right.
    expect(
      container
        .querySelector('.carousel-peek[data-side="previous"] img')
        ?.getAttribute('src'),
    ).toBe('/artworks/degas-dance-class.jpg');
    expect(
      container
        .querySelector('.carousel-peek[data-side="next"] img')
        ?.getAttribute('src'),
    ).toBe('/artworks/vermeer-woman-with-water-pitcher.jpg');

    // They are wall, not content: no name, no place in the reading order.
    for (const peek of peeks) {
      expect(peek).toHaveAttribute('aria-hidden', 'true');
    }
    expect(
      screen.getAllByRole('img', { name: /Elevated view down a wintry/ }),
    ).toHaveLength(1);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(
      screen.queryAllByRole('heading', {
        name: 'Young Woman with a Water Pitcher',
      }),
    ).toHaveLength(0);
  });

  it('shows one fine bar per work, without autoplay', () => {
    const { container } = render(<App />);

    const bars = container.querySelectorAll('.carousel-progress-bar');
    expect(bars).toHaveLength(6);
    expect(
      [...bars].map((bar) => bar.getAttribute('data-active')),
    ).toEqual(['true', 'false', 'false', 'false', 'false', 'false']);
    // Repeats the live status region, which already announces the position.
    expect(container.querySelector('.carousel-progress')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('provides a direct keyboard skip target to the artwork', () => {
    render(<App />);

    expect(
      screen.getByRole('link', { name: 'Skip to the artwork' }),
    ).toHaveAttribute('href', '#artwork-stage');
    expect(document.getElementById('artwork-stage')).not.toBeNull();
  });

  it('starts with a clean canvas and explains agent-triggered local zoom', () => {
    const { container } = render(<App />);

    expect(screen.queryByRole('button', { name: /^Focus region:/ })).toBeNull();
    expect(container.querySelectorAll('.region-focus-marker')).toHaveLength(0);
    expect(container.querySelector('.artwork-canvas')).toHaveAttribute(
      'data-focused-region',
      '',
    );
    expect(
      screen.getByText(/Ask your browser agent to zoom into any visible detail/),
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Show whole artwork' })).toBeNull();
  });
});
