import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Filters from "../../components/Filters";

describe("Filters Component - UI Integration Tests", () => {
  it("should render basic elements (heading, input, button)", () => {
    render(<Filters />);

    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Filter name")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add filter/i })
    ).toBeInTheDocument();
  });

  it("should allow a user to add a new filter via the form", () => {
    render(<Filters />);

    const input = screen.getByPlaceholderText("Filter name");
    const button = screen.getByRole("button", { name: /add filter/i });

    fireEvent.change(input, { target: { value: "React Flow" } });

    fireEvent.click(button);

    expect(screen.getByText("React Flow")).toBeInTheDocument();

    expect(input).toHaveValue("");
  });

  it("should allow a user to toggle a filter (checkbox behavior)", () => {
    render(<Filters />);

    const input = screen.getByPlaceholderText("Filter name");
    const button = screen.getByRole("button", { name: /add filter/i });
    fireEvent.change(input, { target: { value: "TypeScript" } });
    fireEvent.click(button);

    const checkbox = screen.getByDisplayValue("TypeScript");

    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("should remove a filter when clicking on the minus icon", () => {
    const { container } = render(<Filters />);

    fireEvent.change(screen.getByPlaceholderText("Filter name"), {
      target: { value: "Redux" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add filter/i }));

    expect(screen.getByText("Redux")).toBeInTheDocument();

    const removeButton = container.querySelector(".remove-filter-icon");
    expect(removeButton).not.toBeNull();

    fireEvent.click(removeButton!);

    expect(screen.queryByText("Redux")).not.toBeInTheDocument();
  });
});
