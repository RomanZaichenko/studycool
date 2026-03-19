import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MapCreator from "../../components/MapCreator";
import { useMainStore } from "@/store/useMainStore";

vi.mock("@/store/useMainStore");

vi.mock("@/store/slices/createProjectsSlice", () => ({
  GENERAL_PROJECT_ID: 0,
  createProjectsSlice: vi.fn(),
}));

describe("MapCreator Component - UI Integration Tests", () => {
  const mockCloseWindow = vi.fn();
  const mockAddMap = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMainStore).mockImplementation((selector) => {
      const state = {
        projects: [
          { id: 0, title: "General" },
          { id: 1, title: "University" },
        ],
      } as unknown as ReturnType<typeof useMainStore.getState>;

      return selector(state);
    });
  });

  it("should not render if isVisible is false", () => {
    render(
      <MapCreator
        isVisible={false}
        closeWindow={mockCloseWindow}
        addMap={mockAddMap}
      />
    );

    expect(screen.queryByText("Create map")).not.toBeInTheDocument();
  });

  it("should render correctly when isVisible is true", () => {
    render(
      <MapCreator
        isVisible={true}
        closeWindow={mockCloseWindow}
        addMap={mockAddMap}
      />
    );

    expect(screen.getByText("Create map")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();

    expect(screen.getByRole("combobox")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
  });

  it("should update input values when typing", () => {
    render(
      <MapCreator
        isVisible={true}
        closeWindow={mockCloseWindow}
        addMap={mockAddMap}
      />
    );

    const nameInput = screen.getByPlaceholderText("Name") as HTMLInputElement;
    const descInput = screen.getByPlaceholderText(
      "Description"
    ) as HTMLTextAreaElement;

    fireEvent.change(nameInput, { target: { value: "My New Map" } });
    fireEvent.change(descInput, { target: { value: "A cool description" } });

    expect(nameInput.value).toBe("My New Map");
    expect(descInput.value).toBe("A cool description");
  });

  it("should not call addMap if title is empty", () => {
    render(
      <MapCreator
        isVisible={true}
        closeWindow={mockCloseWindow}
        addMap={mockAddMap}
      />
    );

    const createButton = screen.getByRole("button", { name: /create/i });
    fireEvent.click(createButton);

    expect(mockAddMap).not.toHaveBeenCalled();
  });

  it("should submit form data, close window, and send correct projectId", () => {
    render(
      <MapCreator
        isVisible={true}
        closeWindow={mockCloseWindow}
        addMap={mockAddMap}
      />
    );

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "University Map" },
    });
    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "Campus layout" },
    });

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });

    const createButton = screen.getByRole("button", { name: /create/i });
    fireEvent.click(createButton);

    expect(mockAddMap).toHaveBeenCalledWith({
      mapData: {
        title: "University Map",
        description: "Campus layout",
        projectId: 1,
      },
    });

    expect(mockCloseWindow).toHaveBeenCalledTimes(1);
  });
});
