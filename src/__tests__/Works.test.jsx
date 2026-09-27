import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Works from '../components/Works.jsx';
import { works } from '../data.js';
import { read } from '../test/fsHelpers.js';

test('filter narrows the grid and the counter', async () => {
  const user = userEvent.setup();
  render(<Works onOpenWork={() => {}} />);
  expect(screen.getAllByRole('button', { name: /^Open project:/ })).toHaveLength(12);
  await user.click(screen.getByRole('button', { name: 'F&B' }));
  expect(screen.getAllByRole('button', { name: /^Open project:/ })).toHaveLength(6);
  expect(screen.getByTestId('works-count')).toHaveTextContent('06');
});

test('click and Enter open with the filtered list', async () => {
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

test('cards show status; section is concrete and light', () => {
  const { container } = render(<Works onOpenWork={() => {}} />);
  expect(within(screen.getByRole('button', { name: 'Open project: Review Design Petrokimia' })).getByText('[Design proposal]')).toBeInTheDocument();
  expect(container.querySelector('section')).toHaveClass('bg-concrete');
  expect(container.querySelector('section')).toHaveAttribute('data-tone', 'light');
});

test('no hover-dependent handlers or gsap', () => expect(read('src/components/Works.jsx')).not.toMatch(/onMouseEnter|gsap/));
