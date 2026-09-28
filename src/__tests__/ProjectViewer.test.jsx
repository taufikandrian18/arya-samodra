import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectViewer from '../components/ProjectViewer.jsx';
import { getWork } from '../data.js';

const ids = ['arya-samodra-hq', 'petrokimia-review', 'six-nine-coffee-retail'];

test('renders nothing when closed', () => {
  const { container } = render(<ProjectViewer openId={null} ids={ids} onChange={vi.fn()} onClose={vi.fn()} />);
  expect(container).toBeEmptyDOMElement();
});

test('shows project details and counter', () => {
  render(<ProjectViewer openId="petrokimia-review" ids={ids} onChange={vi.fn()} onClose={vi.fn()} />);
  expect(screen.getByRole('heading', { level: 2, name: 'Review Design Petrokimia' })).toBeInTheDocument();
  expect(screen.getByText(/02 \/ 03/)).toBeInTheDocument();
  expect(screen.getByText('PT. Petrokimia Gresik')).toBeInTheDocument();
  expect(screen.getByText('2023')).toBeInTheDocument();
});

test('private clients are shown as such', () => {
  render(<ProjectViewer openId="araya-resto-kostel" ids={['araya-resto-kostel']} onChange={vi.fn()} onClose={vi.fn()} />);
  expect(screen.getByText('Private client')).toBeInTheDocument();
});

test('thumbnails switch the main image', async () => {
  render(<ProjectViewer openId="araya-resto-kostel" ids={['araya-resto-kostel']} onChange={vi.fn()} onClose={vi.fn()} />);
  const n = getWork('araya-resto-kostel').images.length;
  await userEvent.click(screen.getByRole('button', { name: `Image 2 of ${n}` }));
  expect(screen.getByRole('button', { name: `Image 2 of ${n}` })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByAltText(`Araya Resto & Kostel, image 2 of ${n}`)).toBeInTheDocument();
});

test('arrow keys wrap within ids', () => {
  const onChange = vi.fn();
  render(<ProjectViewer openId="six-nine-coffee-retail" ids={ids} onChange={onChange} onClose={vi.fn()} />);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowRight' });
  expect(onChange).toHaveBeenLastCalledWith('arya-samodra-hq');
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowLeft' });
  expect(onChange).toHaveBeenLastCalledWith('petrokimia-review');
});

test('Previous/Next buttons wrap within ids', async () => {
  const onChange = vi.fn();
  render(<ProjectViewer openId="arya-samodra-hq" ids={ids} onChange={onChange} onClose={vi.fn()} />);
  await userEvent.click(screen.getByRole('button', { name: /Previous project/ }));
  expect(onChange).toHaveBeenLastCalledWith('six-nine-coffee-retail');
  await userEvent.click(screen.getByRole('button', { name: /Next project/ }));
  expect(onChange).toHaveBeenLastCalledWith('petrokimia-review');
});

test('Escape and Close both close', async () => {
  const onClose = vi.fn();
  render(<ProjectViewer openId="petrokimia-review" ids={ids} onChange={vi.fn()} onClose={onClose} />);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(onClose).toHaveBeenCalledTimes(2);
});

test('details open in a sheet with the full description', async () => {
  render(<ProjectViewer openId="petrokimia-review" ids={ids} onChange={vi.fn()} onClose={vi.fn()} />);
  const sheet = document.querySelector('aside[aria-label="Project details"]');
  expect(sheet).not.toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Project details' }));
  expect(sheet).toBeVisible();
  expect(within(sheet).getByText(/redefines industrial-scale architecture/)).toBeInTheDocument();
});

test('↑/↓ step through the photos on the ring', () => {
  render(<ProjectViewer openId="araya-resto-kostel" ids={['araya-resto-kostel']} onChange={vi.fn()} onClose={vi.fn()} />);
  const n = getWork('araya-resto-kostel').images.length;
  expect(screen.getAllByRole('button', { name: new RegExp(`^Image \\d+ of ${n}$`) })).toHaveLength(n);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowDown' });
  expect(screen.getByRole('button', { name: `Image 2 of ${n}` })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowUp' });
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'ArrowUp' });
  expect(screen.getByRole('button', { name: `Image ${n} of ${n}` })).toHaveAttribute('aria-pressed', 'true');
});

test('photo buttons step through the photos and wrap', async () => {
  render(<ProjectViewer openId="araya-resto-kostel" ids={['araya-resto-kostel']} onChange={vi.fn()} onClose={vi.fn()} />);
  const n = getWork('araya-resto-kostel').images.length;
  await userEvent.click(screen.getByRole('button', { name: 'Next photo' }));
  expect(screen.getByRole('button', { name: `Image 2 of ${n}` })).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(screen.getByRole('button', { name: 'Previous photo' }));
  await userEvent.click(screen.getByRole('button', { name: 'Previous photo' }));
  expect(screen.getByRole('button', { name: `Image ${n} of ${n}` })).toHaveAttribute('aria-pressed', 'true');
});

test('a touch swipe (sideways or up) moves to the next photo', () => {
  render(<ProjectViewer openId="araya-resto-kostel" ids={['araya-resto-kostel']} onChange={vi.fn()} onClose={vi.fn()} />);
  const n = getWork('araya-resto-kostel').images.length;
  const ring = screen.getByRole('button', { name: `Image 1 of ${n}` }).parentElement;
  const swipe = (pts) => {
    fireEvent.touchStart(ring, { touches: [{ clientX: pts[0][0], clientY: pts[0][1] }] });
    pts.slice(1).forEach(([x, y]) => fireEvent.touchMove(ring, { touches: [{ clientX: x, clientY: y }] }));
    fireEvent.touchEnd(ring, { touches: [] });
  };
  const pressed = () => screen.getAllByRole('button', { pressed: true })[0].getAttribute('aria-label');
  swipe([[300, 500], [200, 500], [60, 500]]);
  expect(pressed()).not.toBe(`Image 1 of ${n}`);
  const after = pressed();
  swipe([[200, 600], [200, 450], [200, 300]]);
  expect(pressed()).not.toBe(after);
});

test('clicking a photo opens an enlarged preview that zooms, steps and closes', async () => {
  render(<ProjectViewer openId="araya-resto-kostel" ids={['araya-resto-kostel']} onChange={vi.fn()} onClose={vi.fn()} />);
  const n = getWork('araya-resto-kostel').images.length;
  await userEvent.click(screen.getByRole('button', { name: `Image 3 of ${n}` }));
  const preview = screen.getByRole('group', { name: `Araya Resto & Kostel, photo 3 of ${n}` });
  expect(within(preview).getByAltText(`Araya Resto & Kostel, image 3 of ${n}, enlarged`)).toBeInTheDocument();
  await userEvent.click(within(preview).getByRole('button', { name: 'Zoom in' }));
  expect(within(preview).getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
  await userEvent.click(within(preview).getByRole('button', { name: 'Next photo' }));
  expect(screen.getByRole('group', { name: `Araya Resto & Kostel, photo 4 of ${n}` })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: `Image 4 of ${n}` })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(screen.queryByRole('group', { name: /photo \d+ of/ })).not.toBeInTheDocument();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});
