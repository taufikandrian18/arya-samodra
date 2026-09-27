import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectStory from '../components/ProjectStory.jsx';
import { getWork } from '../data.js';

const ids = ['araya-resto-kostel', 'joglo-modern-villa'];

test('renders the story: title, facts, statement and the full gallery', () => {
  render(<ProjectStory openId="araya-resto-kostel" ids={ids} onChange={vi.fn()} onClose={vi.fn()} />);
  expect(screen.getByRole('heading', { level: 2, name: 'Araya Resto & Kostel' })).toBeInTheDocument();
  expect(screen.getByText('Private client')).toBeInTheDocument();
  expect(screen.getByText(/harmonize/)).toBeInTheDocument();
  const n = getWork('araya-resto-kostel').images.length;
  expect(screen.getAllByAltText(new RegExp(`^Araya Resto & Kostel, image \\d+ of ${n}$`))).toHaveLength(n - 1);
});

test('next project and close', async () => {
  const onChange = vi.fn();
  const onClose = vi.fn();
  render(<ProjectStory openId="araya-resto-kostel" ids={ids} onChange={onChange} onClose={onClose} />);
  await userEvent.click(screen.getByRole('button', { name: /Next project/ }));
  expect(onChange).toHaveBeenCalledWith('joglo-modern-villa');
  await userEvent.click(screen.getByRole('button', { name: /Close/ }));
  expect(onClose).toHaveBeenCalled();
});
