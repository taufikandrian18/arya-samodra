import { render, screen, within } from '@testing-library/react';
import Services from '../components/Services.jsx';

test('services list scope lines and the six-step workflow', () => {
  const { container } = render(<Services />);
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5);
  expect(screen.getByText(/Macro Planning, Circulation/)).toBeInTheDocument();
  expect(within(screen.getByRole('list', { name: 'Workflow' })).getAllByRole('listitem')).toHaveLength(6);
  expect(container.querySelector('section')).toHaveAttribute('data-tone', 'light');
  expect(container.querySelector('section')).toHaveClass('bg-paper');
});
