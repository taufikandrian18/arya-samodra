import { render, screen, within } from '@testing-library/react';
import Contact from '../components/Contact.jsx';

test('real channels with correct links', () => {
  render(<Contact />);
  expect(screen.getByRole('link', { name: 'architects@aryasamodra.com' })).toHaveAttribute('href', 'mailto:architects@aryasamodra.com');
  expect(screen.getByRole('link', { name: '+62 812-3074-4242' })).toHaveAttribute('href', 'tel:+6281230744242');
  expect(screen.getByRole('link', { name: '+62 31-872-1349' })).toHaveAttribute('href', 'tel:+62318721349');
  expect(screen.getByRole('link', { name: '@arya.architects' })).toHaveAttribute('href', 'https://instagram.com/arya.architects');
});

test('terracotta, dark tone, grouped logos', () => {
  const { container } = render(<Contact />);
  expect(container.querySelector('section')).toHaveClass('bg-terracotta');
  expect(container.querySelector('section')).toHaveAttribute('data-tone', 'dark');
  expect(within(screen.getByRole('group', { name: 'Client logos' })).getAllByRole('img')).toHaveLength(20);
});
