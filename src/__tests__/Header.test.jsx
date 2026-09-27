import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Header from '../components/Header.jsx';

const ref = { current: null };

test('menu toggles, and Esc closes it', async () => {
  const user = userEvent.setup();
  render(<Header scrollerRef={ref} />);
  const btn = screen.getByRole('button', { name: 'Menu' });
  expect(btn).toHaveAttribute('aria-expanded', 'false');
  await user.click(btn);
  expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeVisible();
  await user.keyboard('{Escape}');
  expect(screen.getByRole('button', { name: 'Menu' })).toHaveAttribute('aria-expanded', 'false');
});

test('a link click closes the mobile nav', async () => {
  const user = userEvent.setup();
  render(<Header scrollerRef={ref} />);
  await user.click(screen.getByRole('button', { name: 'Menu' }));
  await user.click(within(screen.getByRole('navigation', { name: 'Mobile' })).getByRole('link', { name: 'Works' }));
  expect(screen.queryByRole('navigation', { name: 'Mobile' })).toBeNull();
});

test('wordmark links to the top', () => {
  render(<Header scrollerRef={ref} />);
  expect(screen.getByRole('link', { name: /ARYA SAMODRA ARCHITECTS/ })).toHaveAttribute('href', '#top');
});
