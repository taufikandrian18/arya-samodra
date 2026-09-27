import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

afterEach(() => window.history.replaceState(null, '', '/'));

test('?work= opens that project', () => {
  window.history.replaceState(null, '', '/?work=joglo-modern-villa');
  render(<App />);
  expect(screen.getByRole('heading', { level: 2, name: 'Joglo Modern Villa & Resort' })).toBeInTheDocument();
});

test('an unknown slug opens nothing and is removed, hash kept', () => {
  window.history.replaceState(null, '', '/?work=old-name#works');
  render(<App />);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(window.location.search).toBe('');
  expect(window.location.hash).toBe('#works');
});

test('opening a card writes the param; Close clears it and returns focus', async () => {
  const user = userEvent.setup();
  render(<App />);
  const card = screen.getByRole('button', { name: 'Open project: Handall Coffee' });
  await user.click(card);
  expect(window.location.search).toBe('?work=handall-coffee');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Close' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(window.location.search).toBe('');
  expect(card).toHaveFocus();
});

test('sections alternate dark and light, in order', () => {
  const { container } = render(<App />);
  const sections = [...container.querySelectorAll('section[data-tone]')].map((s) => `${s.id}:${s.dataset.tone}`);
  expect(sections).toEqual([
    'top:dark', 'studio:light', 'works:dark', 'services:light', 'project:dark', 'team:light', 'contact:dark',
  ]);
});
