import { render, screen } from '@testing-library/react';
import Services from '../components/Services.jsx';

test('services render five headings', () => {
  render(<Services />);
  expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5);
});
