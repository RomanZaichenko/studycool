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
      <NoteEditor 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
        initialTitle="" 
        initialContent="" 
      />
    );

    const titleInput = screen.getByPlaceholderText("Note title");
    const contentInput = screen.getByPlaceholderText("Start typing your note...");

    await user.type(titleInput, "My Auto-save Note");
    await user.type(contentInput, "Some content");

    const closeBtn = screen.getByRole("button", { name: /close note/i });
    await user.click(closeBtn);

    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("triggers file input when clicking on the image placeholder", async () => {
    render(
      <NoteEditor 
        isOpen={true} 
        onClose={mockOnClose} 
        onSave={mockOnSave} 
        initialTitle=""
        initialContent="" 
      />
    );

    const fileInput = screen.getByTestId("file-input") as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click");

    const imagePlaceholder = screen.getByTestId("image-placeholder");
    fireEvent.click(imagePlaceholder);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("renders via portal and allows editing", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <NoteEditor
        isOpen={true}
        onSave={onSave}
        onClose={vi.fn()}
        initialTitle="Old Title"
        initialContent="Old text"
      />
    );

    const textarea = screen.getByPlaceholderText(/start typing/i);
    await user.clear(textarea);
    await user.type(textarea, "New node knowledge");

    const closeBtn = screen.getByLabelText(/close note/i);
    await user.click(closeBtn);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("New node knowledge"),
      })
    );
  });
});