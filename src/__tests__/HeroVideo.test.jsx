import { render } from '@testing-library/react';
import HeroVideo from '../components/HeroVideo.jsx';

const original = window.matchMedia;
afterEach(() => {
  window.matchMedia = original;
});

test('reduced motion shows the poster only', () => {
  window.matchMedia = (q) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} });
  const { container } = render(<HeroVideo />);
  expect(container.querySelector('video')).toBeNull();
  expect(container.querySelector('img')).toHaveAttribute('src', '/media/hero/poster.webp');
});

test('a phone-width viewport gets the 720p rendition', () => {
  const w = window.innerWidth;
  window.innerWidth = 390;
  const { container } = render(<HeroVideo />);
  expect(container.querySelector('video')).toHaveAttribute('src', '/media/hero/hero-720.mp4');
  window.innerWidth = w;
});
