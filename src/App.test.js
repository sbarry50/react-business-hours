import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the business hours heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/React Business Hours/i);
  expect(headingElement).toBeInTheDocument();
});
