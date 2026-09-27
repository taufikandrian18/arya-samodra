import { render, screen } from '@testing-library/react';
import Hero from '../components/Hero.jsx';

test('h1 is the brand triad as three lines', () => {
  const { container } = render(<Hero />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('IMAGINE CREATE ELEVATE');
  expect(container.querySelectorAll('h1 .rise')).toHaveLength(3);
});

test('manifesto and CTA', () => {
  render(<Hero />);
  expect(screen.getByText(/Beyond structure, we design experiences/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /View selected works/ })).toHaveAttribute('href', '#works');
});

test('no caption while hero.caption is null', () => {
  render(<Hero />);
  expect(screen.queryByTestId('hero-caption')).toBeNull();
});
