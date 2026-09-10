import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import NoteEditor from "../../components/NoteEditor";

const getEditorContent = () => document.querySelector(".tiptap") as HTMLElement;

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
        id="test-node-1"
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialTitle=""
        initialContent=""
      />
    );

    const titleInput = screen.getByPlaceholderText("Note title");
    const contentInput = getEditorContent();

    await user.type(titleInput, "My Auto-save Note");
    await user.type(contentInput, "Some content");

    const closeBtn = screen.getByRole("button", { name: /close note/i });
    await user.click(closeBtn);

    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("renders a file input wired up for image uploads behind the image button", () => {
    render(
      <NoteEditor
        id="test-node-2"
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialTitle=""
        initialContent=""
      />
    );

    const label = screen.getByTitle("Insert Image");
    const fileInput = label.querySelector(
      "input[type='file']"
    ) as HTMLInputElement;

    expect(fileInput).not.toBeNull();
    expect(fileInput.accept).toBe("image/*");
  });

  it("renders via portal and allows editing", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();

    render(
      <NoteEditor
        id="test-node-3"
        isOpen={true}
        onSave={onSave}
        onClose={vi.fn()}
        initialTitle="Old Title"
        initialContent="Old text"
      />
    );

    const contentInput = getEditorContent();
    await user.type(contentInput, " New node knowledge");

    const closeBtn = screen.getByLabelText(/close note/i);
    await user.click(closeBtn);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.stringContaining("New node knowledge"),
      })
    );
  });
});
