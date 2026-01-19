import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders LitGraph application title", () => {
  render(<App />);
  const titleElement = screen.getByText(/litgraph/i);
  expect(titleElement).toBeInTheDocument();
});

test("renders Stylometric Analysis module", () => {
  render(<App />);
  const dnaHeading = screen.getByText(/literary dna/i);
  expect(dnaHeading).toBeInTheDocument();
});

test("renders Author Influence Graph module", () => {
  render(<App />);
  const graphHeading = screen.getByText(/author influence/i);
  expect(graphHeading).toBeInTheDocument();
});
