import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useProjectForm } from "../../hooks/useProjectForm";
import { useMainStore } from "@/store/useMainStore";
import React from "react";

vi.mock("@/store/useMainStore");

describe("useProjectForm Hook - Unit Tests", () => {
  const mockAddProject = vi.fn();
  const mockCloseWindow = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMainStore).mockImplementation((selector) => {
      const state = {
        maps: [{ title: "World Map" }, { title: "City Map" }],
        filters: ["Work", "Personal", "Education"],
      } as unknown as ReturnType<typeof useMainStore.getState>;
      return selector(state);
    });
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() =>
      useProjectForm({
        addProject: mockAddProject,
        closeWindow: mockCloseWindow,
      })
    );

    expect(result.current.name).toBe("");
    expect(result.current.description).toBe("");
    expect(result.current.selectedMaps).toEqual([]);
    expect(result.current.selectedFilters).toEqual([]);
  });

  it("should update name and description", () => {
    const { result } = renderHook(() =>
      useProjectForm({
        addProject: mockAddProject,
        closeWindow: mockCloseWindow,
      })
    );

    act(() => {
      result.current.setName("New Project");
      result.current.setDescription("Description here");
    });

    expect(result.current.name).toBe("New Project");
    expect(result.current.description).toBe("Description here");
  });

  it("should filter available maps based on search input", () => {
    const { result } = renderHook(() =>
      useProjectForm({
        addProject: mockAddProject,
        closeWindow: mockCloseWindow,
      })
    );

    act(() => {
      result.current.setMapSearch("World");
    });

    expect(result.current.availableMaps).toEqual(["World Map"]);
    expect(result.current.availableMaps).not.toContain("City Map");
  });

  it("should add and remove maps from selected list", () => {
    const { result } = renderHook(() =>
      useProjectForm({
        addProject: mockAddProject,
        closeWindow: mockCloseWindow,
      })
    );

    act(() => {
      result.current.handleAddMap("World Map");
    });

    expect(result.current.selectedMaps).toContain("World Map");
    expect(result.current.mapSearch).toBe("");

    act(() => {
      result.current.handleRemoveMap("World Map");
    });

    expect(result.current.selectedMaps).not.toContain("World Map");
  });

  it("should handle file change and set fileName", () => {
    const { result } = renderHook(() =>
      useProjectForm({
        addProject: mockAddProject,
        closeWindow: mockCloseWindow,
      })
    );

    const file = new File(["content"], "test-icon.png", { type: "image/png" });
    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleFileChange(event);
    });

    expect(result.current.fileName).toBe("test-icon.png");
  });

  it("should not call addProject if name is empty on submit", () => {
    const { result } = renderHook(() =>
      useProjectForm({
        addProject: mockAddProject,
        closeWindow: mockCloseWindow,
      })
    );

    const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(event);
    });

    expect(mockAddProject).not.toHaveBeenCalled();
  });

  it("should call addProject with full data and reset form on success", () => {
    const { result } = renderHook(() =>
      useProjectForm({
        addProject: mockAddProject,
        closeWindow: mockCloseWindow,
      })
    );

    act(() => {
      result.current.setName("Final Project");
      result.current.setDescription("Final Desc");
      result.current.handleAddMap("City Map");
      result.current.handleAddFilter("Work");
    });

    const event = { preventDefault: vi.fn() } as unknown as React.FormEvent;

    act(() => {
      result.current.handleSubmit(event);
    });

    expect(mockAddProject).toHaveBeenCalledWith({
      title: "Final Project",
      description: "Final Desc",
      iconName: "",
      isCustomIcon: false,
      filters: ["Work"],
      maps: ["City Map"],
    });

    expect(mockCloseWindow).toHaveBeenCalled();
    expect(result.current.name).toBe("");
    expect(result.current.selectedMaps).toEqual([]);
  });
});
