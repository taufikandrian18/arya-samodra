import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectFocus from '../components/ProjectFocus.jsx';
import { focus } from '../data.js';

test('one pane per focus project, in order', () => {
  render(<ProjectFocus onOpenStory={() => {}} />);
  const panes = screen.getAllByRole('article');
  expect(panes).toHaveLength(focus.ids.length);
  expect(within(panes[0]).getByRole('heading', { level: 3, name: 'Araya Resto & Kostel' })).toBeInTheDocument();
});

test('View project opens the story with the focus list and the pane rect', async () => {
  const onOpenStory = vi.fn();
  render(<ProjectFocus onOpenStory={onOpenStory} />);
  await userEvent.click(screen.getByRole('button', { name: 'View project: Joglo Modern Villa & Resort' }));
  expect(onOpenStory).toHaveBeenCalledWith('joglo-modern-villa', focus.ids, expect.objectContaining({ top: expect.any(Number) }));
});

test('every pane photo is its own project cover', () => {
  const { container } = render(<ProjectFocus onOpenStory={() => {}} />);
  const srcs = [...container.querySelectorAll('source[type="image/avif"]')].map((s) => s.getAttribute('srcset'));
  focus.ids.forEach((id, i) => expect(srcs[i]).toContain(`works/${id}/01-`));
});
