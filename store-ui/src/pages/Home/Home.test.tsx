import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';  // 👈 Add vitest globals
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

// Cleanup test DOM after each test run
afterEach(cleanup);

describe('Home Page', () => {
  test('renders welcome message', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const welcomeText = screen.getByText(/welcome to streamlinepay store/i);
    expect(welcomeText).toBeInTheDocument();
  });
});
