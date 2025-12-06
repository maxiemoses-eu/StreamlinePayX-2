import React from 'react'; // FIX: Added React import
import { render, screen } from '@testing-library/react';
import Home from './Home';

// Assuming you have mock handlers for useNavigate and other hooks here

test('renders welcome message', () => {
  render(<Home />);
  const linkElement = screen.getByText(/Welcome to StreamlinePay Store/i);
  expect(linkElement).toBeInTheDocument();
});