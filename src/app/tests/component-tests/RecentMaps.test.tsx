import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecentMaps from "../../components/RecentMaps";
import React from "react";
import { useMainStore } from "@/store/useMainStore";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/store/useMainStore");

vi.mock("@/store/slices/createProjectsSlice", () => ({
  createProjectsSlice: vi.fn(),
  GENERAL_PROJECT_ID: 0,
}));

describe("RecentMaps Component - UI Integration Tests", () => {
  const mockAddMap = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMainStore).mockImplementation((selector) => {
      const state = {
        maps: [
          { id: 1, title: "History Map", lastOpened: new Date("2024-01-01") },
          { id: 2, title: "Biology Map", lastOpened: new Date("2024-01-02") },
        ],
        projects: [{ id: 0, title: "Загальний" }],
        addMap: mockAddMap,
      } as unknown as ReturnType<typeof useMainStore.getState>;

      return selector(state);
    });
  });

  it("should render the section wrapper and the add button", () => {
    render(<RecentMaps />);

    expect(screen.getByText("Recent Maps")).toBeInTheDocument();

    const addButton = screen.getByLabelText("Create new map");
    expect(addButton).toBeInTheDocument();

    expect(screen.getByText("History Map")).toBeInTheDocument();
    expect(screen.getByText("Biology Map")).toBeInTheDocument();
  });

  it("should open the MapCreator modal when the add button is clicked", async () => {
    render(<RecentMaps />);

    const addButton = screen.getByLabelText("Create new map");
    fireEvent.click(addButton);

    expect(await screen.findByText("Create map")).toBeInTheDocument();
  });

  it("should call addMap action when a new map is submitted", async () => {
    render(<RecentMaps />);

    fireEvent.click(screen.getByLabelText("Create new map"));
    await screen.findByText("Create map");

    const nameInput = screen.getByPlaceholderText("Name");
    fireEvent.change(nameInput, { target: { value: "My Geography Map" } });

    const createButton = screen.getByRole("button", { name: /^create$/i });
    fireEvent.click(createButton);

    expect(mockAddMap).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalled();
    expect(screen.queryByText("Create map")).not.toBeInTheDocument();
  });

  it("should sort maps by lastOpened date", () => {
    render(<RecentMaps />);

    const cards = screen.getAllByRole("heading", { level: 3 });
    expect(cards[0].textContent).toBe("Biology Map");
    expect(cards[1].textContent).toBe("History Map");
  });
});
