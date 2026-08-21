import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("PRINGGASURYA application shell", () => {
  it("renders the public landing page and clear simulation entry point", async () => {
    window.location.hash = "#/";
    render(<App />);
    expect(await screen.findByRole("heading", { name: /air tepat waktu.*energi dari matahari/i })).toBeInTheDocument();
    expect(screen.getByText(/sistem irigasi pintar berbasis agrivoltaik/i)).toBeInTheDocument();
    expect(screen.getByText("Prototipe Simulasi")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /lihat demo sistem/i })).toHaveAttribute("href", "#/operate/live");
    expect(screen.getByRole("link", { name: /masuk sebagai operator/i })).toHaveAttribute("href", "#/login");
    expect(screen.queryByText(/desa sisik/i)).not.toBeInTheDocument();
  });

  it("keeps the primary navigation simple and completes an irrigation command", async () => {
    const user = userEvent.setup();
    window.location.hash = "#/operate/irrigation";
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Kontrol Irigasi" })).toBeInTheDocument();
    const primaryNavigation = screen.getByRole("navigation", { name: "Navigasi utama" });
    expect(within(primaryNavigation).getAllByRole("link")).toHaveLength(5);

    await user.click(screen.getByRole("button", { name: /Zona 02/i }));
    await user.click(screen.getByRole("button", { name: "Mulai Irigasi" }));
    expect(screen.getByRole("dialog", { name: "Konfirmasi tindakan" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Konfirmasi dan mulai" }));

    await waitFor(() => expect(screen.getAllByText("Sedang diairi").length).toBeGreaterThan(0));
  });

  it("provides a transparent simulation lab and dataset exports", async () => {
    window.location.hash = "#/simulation";
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Simulation Lab" })).toBeInTheDocument();
    expect(screen.getByText("PRINGGASURYA Physical Rules v1")).toBeInTheDocument();
    expect(screen.getByText(/ini bukan pembacaan lapangan/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /7 hari/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /gangguan pompa/i })).toBeInTheDocument();
  });

  it("shows water-quality decisions without presenting synthetic data as laboratory evidence", async () => {
    window.location.hash = "#/operate/water-quality";
    render(<App />);

    expect(await screen.findByRole("heading", { name: /periksa air sebelum dialirkan/i })).toBeInTheDocument();
    expect(screen.getByText(/nilai pada halaman ini merupakan data sintetis/i)).toBeInTheDocument();
    expect(screen.getByText(/dashboard tidak menyatakan air tercemar atau aman secara definitif/i)).toBeInTheDocument();
  });
});
