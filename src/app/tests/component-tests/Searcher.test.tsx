import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Searcher from "../../components/Searcher";
import { useMainStore } from "@/store/useMainStore";
import { useMapEditorStore } from "@/store/useMapEditorStore";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/store/useMainStore");
vi.mock("@/store/useMapEditorStore");

describe("Searcher Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMainStore).mockImplementation((selector) => {
      const state = {
        projects: [{ id: "p1", title: "My Project", description: "" }],
        maps: [
          {
            id: "m1",
            title: "Biology Map",
            projectId: "p1",
            description: "",
            nodes: [{ id: "n1", data: { label: "Cell", noteContent: "" } }],
          },
        ],
      } as unknown as ReturnType<typeof useMainStore.getState>;
      return selector(state);
    });

    vi.mocked(useMapEditorStore).mockImplementation((selector) => {
      const state = {
        nodes: [],
        currentMapId: null,
      } as unknown as ReturnType<typeof useMapEditorStore.getState>;
      return selector(state);
    });
  });

  it("does not show the dropdown before typing anything", () => {
    render(<Searcher />);
    expect(screen.queryByText("Нічого не знайдено")).not.toBeInTheDocument();
  });

  it("finds a map by title after the debounce delay", async () => {
    render(<Searcher />);
    fireEvent.change(screen.getByLabelText("Searcher"), {
      target: { value: "Biology" },
    });

    await waitFor(
      () => expect(screen.getAllByRole("listitem")).toHaveLength(1),
      { timeout: 1000 }
    );
    const item = screen.getByRole("listitem");
    expect(item.textContent).toContain("Biology");
    expect(item.textContent).toContain("Map");
    expect(screen.getByText("Мапа")).toBeInTheDocument();
  });

  it("finds a node by its label inside a map", async () => {
    render(<Searcher />);
    fireEvent.change(screen.getByLabelText("Searcher"), {
      target: { value: "Cell" },
    });

    await waitFor(
      () => expect(screen.getAllByRole("listitem")).toHaveLength(1),
      { timeout: 1000 }
    );
    expect(screen.getByRole("listitem").textContent).toContain("Cell");
  });

  it("shows 'Нічого не знайдено' when there are no matches", async () => {
    render(<Searcher />);
    fireEvent.change(screen.getByLabelText("Searcher"), {
      target: { value: "zzzzz-no-match" },
    });

    await waitFor(
      () => expect(screen.getByText("Нічого не знайдено")).toBeInTheDocument(),
      { timeout: 1000 }
    );
  });

  it("navigates to the map page when a map result is clicked", async () => {
    render(<Searcher />);
    fireEvent.change(screen.getByLabelText("Searcher"), {
      target: { value: "Biology" },
    });

    await waitFor(
      () => expect(screen.getAllByRole("listitem")).toHaveLength(1),
      { timeout: 1000 }
    );

    fireEvent.click(screen.getByRole("listitem"));
    expect(mockPush).toHaveBeenCalledWith("/map-area/m1");
  });
});
