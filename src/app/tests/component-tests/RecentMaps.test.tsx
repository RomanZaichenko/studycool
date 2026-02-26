import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecentMaps from "../../components/RecentMaps";
import React from "react";

// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("RecentMaps Component - UI Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("should render the section wrapper and the add button", () => {
    render(<RecentMaps />);

    expect(screen.getByText("Recent Maps")).toBeInTheDocument();

    const addButton = screen.getAllByRole("button")[0];
    expect(addButton).toBeInTheDocument();
  });

  it("should open the MapCreator modal when the add button is clicked", async () => {
    render(<RecentMaps />);
    const addButton = screen.getAllByRole("button")[0];
    fireEvent.click(addButton);

    expect(await screen.findByText("Create map")).toBeInTheDocument();
  });

  it("should add a new map and display its card on the screen", async () => {
    render(<RecentMaps />);

    const addButton = screen.getAllByRole("button")[0];
    fireEvent.click(addButton);
    await screen.findByText("Create map");

    const nameInput = screen.getByPlaceholderText("Name");
    fireEvent.change(nameInput, { target: { value: "My Geography Map" } });

    const createButton = screen.getByRole("button", { name: /create/i });
    fireEvent.click(createButton);

    expect(await screen.findByText("My Geography Map")).toBeInTheDocument();
    expect(screen.queryByText("Create map")).not.toBeInTheDocument();
  });
});