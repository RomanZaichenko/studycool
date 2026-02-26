import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProjectCreator from "../../components/ProjectCreator";

describe("ProjectCreator Component - UI Integration Tests", () => {
  const mockCloseWindow = vi.fn();
  const mockAddProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render correctly when isVisible is true", async () => {
    render(
      <ProjectCreator
        isVisible={true}
        closeWindow={mockCloseWindow}
        addProject={mockAddProject}
      />
    );

    expect(await screen.findByText("Create project")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Description")).toBeInTheDocument();
    expect(screen.getByText("Choose from files...")).toBeInTheDocument();
  });

  it("should update text inputs correctly", async () => {
    render(
      <ProjectCreator
        isVisible={true}
        closeWindow={mockCloseWindow}
        addProject={mockAddProject}
      />
    );
    await screen.findByText("Create project");

    const nameInput = screen.getByPlaceholderText("Name") as HTMLInputElement;
    const descInput = screen.getByPlaceholderText(
      "Description"
    ) as HTMLTextAreaElement;

    fireEvent.change(nameInput, { target: { value: "Knowledge map" } });
    fireEvent.change(descInput, {
      target: { value: "A knowledge map application" },
    });

    expect(nameInput.value).toBe("Knowledge map");
    expect(descInput.value).toBe("A knowledge map application");
  });

  it("should handle file selection (icon upload)", async () => {
    render(
      <ProjectCreator
        isVisible={true}
        closeWindow={mockCloseWindow}
        addProject={mockAddProject}
      />
    );
    await screen.findByText("Create project");

    const file = new File(["icon-content"], "logo.png", { type: "image/png" });

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByText("logo.png")).toBeInTheDocument();
  });

  it("should not call addProject if the name field is empty", async () => {
    render(
      <ProjectCreator
        isVisible={true}
        closeWindow={mockCloseWindow}
        addProject={mockAddProject}
      />
    );
    await screen.findByText("Create project");

    const createButton = screen.getByRole("button", { name: /create/i });
    fireEvent.click(createButton);

    expect(mockAddProject).not.toHaveBeenCalled();
  });

  it("should submit the correct project data and close the window", async () => {
    render(
      <ProjectCreator
        isVisible={true}
        closeWindow={mockCloseWindow}
        addProject={mockAddProject}
      />
    );
    await screen.findByText("Create project");

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "Project Alpha" },
    });
    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "Test description" },
    });

    const file = new File(["content"], "icon.png", { type: "image/png" });
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    const createButton = screen.getByRole("button", { name: /create/i });
    fireEvent.click(createButton);

    expect(mockAddProject).toHaveBeenCalledWith({
      projectData: {
        title: "Project Alpha",
        description: "Test description",
        iconName: "icon.png",
        isCustomIcon: true,
        filters: [],
      },
    });

    expect(mockCloseWindow).toHaveBeenCalledTimes(1);
  });
});
