import { render, screen, within } from '@testing-library/react';
import Studio from '../components/Studio.jsx';

test('about heading, founding year and principal credentials', () => {
  render(<Studio />);
  expect(screen.getByRole('heading', { level: 2, name: /Crafting a Legacy/ })).toBeInTheDocument();
  expect(screen.getByText('2019')).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 3, name: 'Ar. Arya Samodra, IAI' })).toBeInTheDocument();
  expect(screen.getByText(/STRA No\. 2\.01\.0\.0004734/)).toBeInTheDocument();
  expect(within(screen.getByRole('list', { name: 'Record' })).getAllByRole('listitem')).toHaveLength(3);
  expect(screen.getByAltText('Ar. Arya Samodra Hening, IAI')).toBeInTheDocument();
});
