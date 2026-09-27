import { fireEvent, render, screen } from '@testing-library/react';
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
  expect(screen.getByText('02 / 03')).toBeInTheDocument();
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
