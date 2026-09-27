import { render, screen } from '@testing-library/react';
import Team from '../components/Team.jsx';

test('team shows six portraits with profile roles', () => {
  render(<Team />);
  expect(screen.getAllByRole('img')).toHaveLength(6);
  expect(screen.getByText('Jr. Interior Designer')).toBeInTheDocument();
  expect(screen.getByText('Technical Drafter')).toBeInTheDocument();
  expect(screen.queryByText(/PORTRAIT 3:4/)).toBeNull();
});
