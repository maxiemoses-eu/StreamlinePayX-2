import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Home from './Home';

afterEach(cleanup);

test('renders welcome message', () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
  const linkElement = screen.getByText(/Welcome to StreamlinePay Store/i);
  expect(linkElement).toBeInTheDocument();
});
