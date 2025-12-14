import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Emotion Recognition header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Emotion Recognition/i);
  expect(headerElement).toBeInTheDocument();
});
