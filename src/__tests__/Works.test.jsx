import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Works from '../components/Works.jsx';
import { works } from '../data.js';
import { read } from '../test/fsHelpers.js';

test('filter narrows the list and the counter', async () => {
  const user = userEvent.setup();
  render(<Works onOpenWork={() => {}} />);
  expect(screen.getAllByRole('button', { name: /^Open project:/ })).toHaveLength(12);
  await user.click(screen.getByRole('button', { name: 'F&B' }));
  expect(screen.getAllByRole('button', { name: /^Open project:/ })).toHaveLength(6);
  expect(screen.getByTestId('works-count')).toHaveTextContent('06');
});

test('click and Enter on a row open with the filtered list', async () => {
  const user = userEvent.setup();
  const onOpenWork = vi.fn();
  render(<Works onOpenWork={onOpenWork} />);
  await user.click(screen.getByRole('button', { name: 'F&B' }));
  await user.click(screen.getByRole('button', { name: 'Open project: Monograph Coffee' }));
  expect(onOpenWork).toHaveBeenCalledWith('monograph-coffee', works.filter((w) => w.type === 'F&B').map((w) => w.id));
  screen.getByRole('button', { name: 'Open project: Handall Coffee' }).focus();
  await user.keyboard('{Enter}');
  expect(onOpenWork).toHaveBeenLastCalledWith('handall-coffee', expect.any(Array));
});

test('keyboard focus drives the preview, and the preview opens its project', async () => {
  const onOpenWork = vi.fn();
  render(<Works onOpenWork={onOpenWork} />);
  expect(screen.getByRole('button', { name: 'View project: HQ Office Arya Samodra Architects' })).toBeInTheDocument();
  fireEvent.focus(screen.getByRole('button', { name: 'Open project: Smesta Coffee & Dining' }));
  const preview = screen.getByRole('button', { name: 'View project: Smesta Coffee & Dining' });
  await userEvent.click(preview);
  expect(onOpenWork).toHaveBeenCalledWith('smesta-coffee-dining', works.map((w) => w.id));
});

test('rows show status; section is navy and dark', () => {
  const { container } = render(<Works onOpenWork={() => {}} />);
  expect(within(screen.getByRole('button', { name: 'Open project: Review Design Petrokimia' })).getByText('[Design proposal]')).toBeInTheDocument();
  expect(container.querySelector('section')).toHaveClass('bg-navy');
  expect(container.querySelector('section')).toHaveAttribute('data-tone', 'dark');
});

test('no gsap, and opening never depends on mouseenter', () => {
  const src = read('src/components/Works.jsx');
  expect(src).not.toMatch(/gsap|onMouseEnter/);
});
