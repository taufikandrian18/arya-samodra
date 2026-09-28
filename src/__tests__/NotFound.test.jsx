import { render, screen } from '@testing-library/react';
import NotFound from '../components/NotFound.jsx';
import { isKnownPath } from '../lib/route.js';
import copy from '../content/not-found.json';

test('only the site root is a known path', () => {
  expect(isKnownPath('/', '/')).toBe(true);
  expect(isKnownPath('/index.html', '/')).toBe(true);
  expect(isKnownPath('/arya-samodra/', '/arya-samodra/')).toBe(true);
  expect(isKnownPath('/arya-samodra', '/arya-samodra/')).toBe(true);
  expect(isKnownPath('/arya-samodra/index.html', '/arya-samodra/')).toBe(true);
  expect(isKnownPath('/arya-samodra/about', '/arya-samodra/')).toBe(false);
  expect(isKnownPath('/nope', '/')).toBe(false);
});

test('404 page: heading, the missing path, links home, noindex', () => {
  window.history.pushState({}, '', '/some/missing-page');
  render(<NotFound />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(copy.heading);
  expect(screen.getByText('/some/missing-page')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: new RegExp(copy.home) })).toHaveAttribute('href', '/');
  expect(screen.getByRole('link', { name: 'Selected works' })).toHaveAttribute('href', '/#works');
  expect(document.title).toBe(copy.title);
  expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  window.history.pushState({}, '', '/');
});
