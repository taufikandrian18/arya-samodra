import { render, screen } from '@testing-library/react';
import Picture from '../components/ui/Picture.jsx';
import { getImage } from '../lib/media.js';

const key = 'works/araya-resto-kostel/01';

test('AVIF srcset lists the ladder', () => {
  const { container } = render(<Picture name={key} alt="Araya" />);
  expect(container.querySelector('source[type="image/avif"]').getAttribute('srcset')).toContain('-480.avif 480w');
});

test('lazy by default with manifest dimensions', () => {
  render(<Picture name={key} alt="Araya" />);
  const img = screen.getByAltText('Araya');
  expect(img).toHaveAttribute('loading', 'lazy');
  expect(img).toHaveAttribute('width', String(getImage(key).w));
});

test('eager sets fetchpriority high', () => {
  render(<Picture name={key} alt="Araya" eager />);
  expect(screen.getByAltText('Araya')).toHaveAttribute('fetchpriority', 'high');
});

test('reveal=false is open immediately', () => {
  const { container } = render(<Picture name={key} alt="Araya" reveal={false} />);
  expect(container.querySelector('.aperture')).toHaveAttribute('data-state', 'open');
});

test('unknown key renders a neutral frame and warns once', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  render(<><Picture name="works/missing/01" alt="Missing" /><Picture name="works/missing/01" alt="Missing again" /></>);
  expect(screen.getByRole('img', { name: 'Missing' })).toBeInTheDocument();
  expect(warn).toHaveBeenCalledTimes(1);
  warn.mockRestore();
});
