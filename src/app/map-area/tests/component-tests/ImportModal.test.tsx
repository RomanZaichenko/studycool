import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImportModal } from "../../components/ImportModal";
import { useMapEditorStore } from "@/store/useMapEditorStore";
import { processImport } from "@/lib/importService";

vi.mock("@/store/useMapEditorStore");
vi.mock("@/lib/importService", () => ({ processImport: vi.fn() }));

const makeFile = () => new File(["{}"], "backup.studycool");

describe("ImportModal Component", () => {
  const mockOnClose = vi.fn();
  const mockOnImport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useMapEditorStore).mockImplementation((selector) => {
      const state = {
        nodes: [{ id: "existing-1" }],
      } as unknown as ReturnType<typeof useMapEditorStore.getState>;
      return selector(state);
    });
  });

  it("renders nothing when isOpen is false", () => {
    render(
      <ImportModal isOpen={false} onClose={mockOnClose} onImport={mockOnImport} />
    );
    expect(screen.queryByText("Import Map")).not.toBeInTheDocument();
  });

  it("imports directly and closes when there is no ID conflict", async () => {
    vi.mocked(processImport).mockResolvedValue({
      nodes: [{ id: "new-1" }] as never,
      edges: [],
    });

    render(
      <ImportModal isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
    );

    const input = screen.getByLabelText(/select \.studycool file/i, {
      selector: "input",
    }) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile()] } });

    await waitFor(() => expect(mockOnImport).toHaveBeenCalledWith({
      nodes: [{ id: "new-1" }],
      edges: [],
    }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("shows the conflict screen instead of importing when an ID already exists", async () => {
    vi.mocked(processImport).mockResolvedValue({
      nodes: [{ id: "existing-1" }] as never,
      edges: [],
    });

    render(
      <ImportModal isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
    );

    const input = screen.getByLabelText(/select \.studycool file/i, {
      selector: "input",
    }) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile()] } });

    await waitFor(() =>
      expect(screen.getByText("Attention: Data Conflict")).toBeInTheDocument()
    );
    expect(mockOnImport).not.toHaveBeenCalled();
  });

  it("generates fresh IDs and imports when 'Create Copy' is chosen after a conflict", async () => {
    vi.mocked(processImport).mockResolvedValue({
      nodes: [{ id: "existing-1" }] as never,
      edges: [],
    });

    render(
      <ImportModal isOpen={true} onClose={mockOnClose} onImport={mockOnImport} />
    );

    const input = screen.getByLabelText(/select \.studycool file/i, {
      selector: "input",
    }) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile()] } });

    await waitFor(() =>
      expect(screen.getByText("Attention: Data Conflict")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("Create Copy (Generate New IDs)"));

    expect(mockOnImport).toHaveBeenCalledTimes(1);
    const importedArg = mockOnImport.mock.calls[0][0];
    expect(importedArg.nodes[0].id).not.toBe("existing-1");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});