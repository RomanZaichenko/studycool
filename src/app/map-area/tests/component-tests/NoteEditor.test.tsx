import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NoteEditor from "../../components/NoteEditor";

describe("NoteEditor Component - Unit Tests", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls onSave and onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <NoteEditor isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );

    const titleInput = screen.getByPlaceholderText("Note title");
    const contentInput = screen.getByPlaceholderText(
      "Start typing your note..."
    );

    await user.type(titleInput, "My Auto-save Note");
    await user.type(contentInput, "Some content");

    const closeBtn = screen.getByRole("button", { name: /close note/i });
    await user.click(closeBtn);

    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("triggers file input when clicking on the image placeholder", async () => {
    render(
      <NoteEditor isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );

    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");

    const imagePlaceholder = screen.getByTestId("image-placeholder");
    fireEvent.click(imagePlaceholder);

    expect(clickSpy).toHaveBeenCalled();
  });
});
