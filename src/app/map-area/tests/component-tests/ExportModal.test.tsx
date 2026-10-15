import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExportModal } from "../../components/ExportModal";
import { useMapEditorStore } from "@/store/useMapEditorStore";
import { useMainStore } from "@/store/useMainStore";
import { processExport } from "@/lib/export";

vi.mock("@/store/useMapEditorStore");
vi.mock("@/store/useMainStore");
vi.mock("@/lib/export", () => ({ processExport: vi.fn() }));

describe("ExportModal Component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMapEditorStore).mockImplementation((selector) => {
      const state = {
        nodes: [{ id: "n1" }],
        edges: [],
        currentMapId: "map-1",
      } as unknown as ReturnType<typeof useMapEditorStore.getState>;
      return selector(state);
    });

    vi.mocked(useMainStore).mockImplementation((selector) => {
      const state = {
        maps: [{ id: "map-1", title: "My Test Map" }],
      } as unknown as ReturnType<typeof useMainStore.getState>;
      return selector(state);
    });
  });

  it("renders nothing when isOpen is false", () => {
    render(
      <ExportModal isOpen={false} onClose={mockOnClose} exportType="map" />
    );
    expect(screen.queryByText("Export Mind Map")).not.toBeInTheDocument();
  });

  it("shows the map categories and defaults to the first one's first extension", () => {
    render(<ExportModal isOpen={true} onClose={mockOnClose} exportType="map" />);

    expect(screen.getByText("Export Mind Map")).toBeInTheDocument();
    expect(screen.getByText("Image")).toBeInTheDocument();
    expect(screen.getByText("Document")).toBeInTheDocument();
    expect(screen.getByText("StudyCool File")).toBeInTheDocument();
    expect(screen.getByText("Export as .png")).toBeInTheDocument();
  });

  it("switches extension when a different format button is clicked", () => {
    render(<ExportModal isOpen={true} onClose={mockOnClose} exportType="map" />);

    fireEvent.click(screen.getByText(".jpeg"));
    expect(screen.getByText("Export as .jpeg")).toBeInTheDocument();
  });

  it("calls processExport with the map's title and closes on export", async () => {
    render(<ExportModal isOpen={true} onClose={mockOnClose} exportType="map" />);

    fireEvent.click(screen.getByText("Export as .png"));

    expect(processExport).toHaveBeenCalledWith(
      "png",
      "My Test Map",
      [{ id: "n1" }],
      [],
      undefined
    );
    await waitFor(() => expect(mockOnClose).toHaveBeenCalledTimes(1));
  });

  it("shows an alert and keeps the modal open when export fails", async () => {
    vi.mocked(processExport).mockRejectedValueOnce(new Error("boom"));
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<ExportModal isOpen={true} onClose={mockOnClose} exportType="map" />);
    fireEvent.click(screen.getByText("Export as .png"));

    await waitFor(() => expect(alertSpy).toHaveBeenCalledTimes(1));
    expect(mockOnClose).not.toHaveBeenCalled();

    alertSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("calls onClose without exporting when Cancel is clicked", () => {
    render(<ExportModal isOpen={true} onClose={mockOnClose} exportType="map" />);

    fireEvent.click(screen.getByText("CANCEL"));

    expect(processExport).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("shows only the note categories (no Image/StudyCool) for exportType='note'", () => {
    render(<ExportModal isOpen={true} onClose={mockOnClose} exportType="note" />);

    expect(screen.getByText("Export Note")).toBeInTheDocument();
    expect(screen.queryByText("Image")).not.toBeInTheDocument();
    expect(screen.queryByText("StudyCool File")).not.toBeInTheDocument();
  });
});