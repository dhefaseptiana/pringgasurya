import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("PRINGGASURYA application shell", () => {
  it("renders the Pringgarata identity and permanent simulation disclosure", async () => {
    window.location.hash = "#/";
    render(<App />);
    expect(await screen.findByRole("heading", { name: /air untuk tanaman.*energi dari matahari/i })).toBeInTheDocument();
    expect(screen.getByText(/kec\. pringgarata/i)).toBeInTheDocument();
    expect(screen.getByText("SIMULATION MODE")).toBeInTheDocument();
    expect(screen.queryByText(/desa sisik/i)).not.toBeInTheDocument();
  });
});
