import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders the business hours heading', () => {
  const { getByText } = render(<App />);
  const heading = getByText(/React Business Hours/i);
  expect(heading).toBeInTheDocument();
});
