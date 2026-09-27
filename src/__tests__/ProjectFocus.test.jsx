import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectFocus from '../components/ProjectFocus.jsx';
import { workIds } from '../data.js';

test('opens Araya in the viewer', async () => {
  const onOpenWork = vi.fn();
  render(<ProjectFocus onOpenWork={onOpenWork} />);
  expect(screen.getByRole('heading', { level: 2, name: 'Araya Resto & Kostel' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'View project' }));
  expect(onOpenWork).toHaveBeenCalledWith('araya-resto-kostel', workIds);
});

test('every photo shown belongs to Araya', () => {
  const { container } = render(<ProjectFocus onOpenWork={() => {}} />);
  const srcs = [...container.querySelectorAll('source')].map((s) => s.getAttribute('srcset')).join(' ');
  expect(srcs).not.toMatch(/works\/(?!araya-resto-kostel\/)/);
  expect(container.querySelectorAll('[data-testid="focus-tile"]')).toHaveLength(2);
});
