import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIChat } from "../../components/AIChat";
import { useMapEditorStore } from "@/store/useMapEditorStore";

vi.mock("@/store/useMapEditorStore");

describe("AIChat Component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useMapEditorStore).mockImplementation((selector) => {
      const state = {
        currentMapId: "map-1",
        nodes: [],
      } as unknown as ReturnType<typeof useMapEditorStore.getState>;
      return selector(state);
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ reply: "Sure, here's the answer." }),
      })
    );
  });

  it("shows the map-aware greeting when a map is open", () => {
    render(<AIChat onClose={mockOnClose} />);
    expect(
      screen.getByText(/what would you like to know about this material/i)
    ).toBeInTheDocument();
  });

  it("sends a message and displays the AI's reply", async () => {
    render(<AIChat onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText("Type your message...");
    fireEvent.change(input, { target: { value: "Explain photosynthesis" } });
    fireEvent.click(screen.getByLabelText("Send message"));

    expect(screen.getByText("Explain photosynthesis")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("Sure, here's the answer.")).toBeInTheDocument()
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("shows an error message bubble when the API call fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "boom" }) })
    );

    render(<AIChat onClose={mockOnClose} />);
    fireEvent.change(screen.getByPlaceholderText("Type your message..."), {
      target: { value: "Hi" },
    });
    fireEvent.click(screen.getByLabelText("Send message"));

    await waitFor(() =>
      expect(
        screen.getByText(/error occurred while communicating/i)
      ).toBeInTheDocument()
    );
  });

  it("does not send an empty message", () => {
    render(<AIChat onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText("Send message"));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls onClose when clicking outside the chat window", () => {
    render(
      <div>
        <AIChat onClose={mockOnClose} />
        <div data-testid="outside">outside</div>
      </div>
    );

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});