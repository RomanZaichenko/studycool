import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Projects from "../../components/Projects";
import React from "react";
import { useMainStore } from "@/store/useMainStore";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || "mocked-image"} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/store/useMainStore");

vi.mock("@/store/slices/createProjectsSlice", () => ({
  createProjectsSlice: vi.fn(),
  GENERAL_PROJECT_ID: 1,
}));

describe("Projects Component", () => {
  const mockAddProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMainStore).mockImplementation((selector) => {
      const state = {
        projects: [
          { id: 1, title: "General", iconName: "gen.png", filters: [] },
          { id: 2, title: "Alpha", iconName: "alpha.png", filters: ["Work"] },
        ],
        selectedFilters: [],
        addProject: mockAddProject,
      } as unknown as ReturnType<typeof useMainStore.getState>;

      return selector(state);
    });
  });

  it("should render the section wrapper and the add button", () => {
    render(<Projects />);

    expect(screen.getByText("Projects")).toBeInTheDocument();

    expect(screen.getByLabelText("Create new project")).toBeInTheDocument();

    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("should open the ProjectCreator modal when the add button is clicked", async () => {
    render(<Projects />);

    const addButton = screen.getByLabelText("Create new project");
    fireEvent.click(addButton);

    expect(await screen.findByText("Create project")).toBeInTheDocument();
  });

  it("should call addProject when a new project is submitted in the modal", async () => {
    render(<Projects />);

    fireEvent.click(screen.getByLabelText("Create new project"));
    await screen.findByText("Create project");

    const nameInput = screen.getByPlaceholderText("Name");
    fireEvent.change(nameInput, { target: { value: "New Test Project" } });

    const createButton = screen.getByRole("button", { name: /^create$/i });
    fireEvent.click(createButton);

    expect(mockAddProject).toHaveBeenCalled();

    expect(screen.queryByText("Create project")).not.toBeInTheDocument();
  });

  it("should filter projects based on selected filters in the store", () => {
    vi.mocked(useMainStore).mockImplementation((selector) => {
      const state = {
        projects: [
          { id: 1, title: "General", filters: [] },
          { id: 2, title: "Work Project", filters: ["Work"] },
          { id: 3, title: "Home Project", filters: ["Home"] },
        ],
        selectedFilters: ["Work"],
        addProject: mockAddProject,
      } as unknown as ReturnType<typeof useMainStore.getState>;

      return selector(state);
    });

    render(<Projects />);

    expect(screen.getByText("Work Project")).toBeInTheDocument();
    expect(screen.queryByText("Home Project")).not.toBeInTheDocument();
  });
});
