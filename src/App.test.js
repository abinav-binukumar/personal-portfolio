import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the header logo', () => {
  render(<App />);
  const logoElement = screen.getByText(/A\.B/i);
  expect(logoElement).toBeInTheDocument();
});
