import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Filters from "../../components/Filters";
import { useMainStore } from "@/store/useMainStore";

vi.mock("@/store/useMainStore");

describe("Filters Component - Unit Tests (Mocked Store)", () => {
  const mockAddFilter = vi.fn();
  const mockToggleFilter = vi.fn();
  const mockRemoveFilter = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMainStore).mockImplementation((selector) => {
      const state = {
        filters: ["TypeScript", "React Flow"],
        selectedFilters: ["TypeScript"],
        addFilter: mockAddFilter,
        toggleFilter: mockToggleFilter,
        removeFilter: mockRemoveFilter,
      } as unknown as ReturnType<typeof useMainStore.getState>;

      return selector(state);
    });
  });

  it("should render basic elements (heading, input, button) and initial filters", () => {
    render(<Filters />);

    expect(
      screen.getByRole("heading", { name: "Filters" })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Filter name")).toBeInTheDocument();

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("React Flow")).toBeInTheDocument();
  });

  it("should call addFilter when form is submitted", () => {
    render(<Filters />);

    const input = screen.getByPlaceholderText("Filter name");
    const button = screen.getByRole("button", { name: /add filter/i });

    fireEvent.change(input, { target: { value: "Redux" } });
    fireEvent.click(button);

    expect(mockAddFilter).toHaveBeenCalledTimes(1);
    expect(mockAddFilter).toHaveBeenCalledWith("Redux");

    expect(input).toHaveValue("");
  });

  it("should call toggleFilter when a filter checkbox is clicked", () => {
    render(<Filters />);

    const filterLabel = screen.getByText("React Flow");
    fireEvent.click(filterLabel);

    expect(mockToggleFilter).toHaveBeenCalledTimes(1);
    expect(mockToggleFilter).toHaveBeenCalledWith("React Flow");
  });

  it("should call removeFilter when clicking on the minus icon", () => {
    const { container } = render(<Filters />);

    const removeButtons = container.querySelectorAll(".remove-filter-icon");

    if (removeButtons[0]) {
      fireEvent.click(removeButtons[0]);
    }

    expect(mockRemoveFilter).toHaveBeenCalledTimes(1);
    expect(mockRemoveFilter).toHaveBeenCalledWith("TypeScript");
  });
});
