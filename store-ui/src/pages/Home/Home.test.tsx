import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

describe("Home Page", () => {
  it("renders Featured Daily Offers section", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // ✅ Check for a heading that exists in Home.tsx
    const heading = screen.getByText(/featured daily offers/i);
    expect(heading).toBeInTheDocument();
  });
});
