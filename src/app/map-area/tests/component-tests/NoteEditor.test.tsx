import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteEditor from "../../components/NoteEditor";

describe("NoteEditor Component", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly when isOpen is true", () => {
    render(
      <NoteEditor isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );

    expect(screen.getByPlaceholderText("Note title")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Start typing your note...")
    ).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <NoteEditor isOpen={false} onClose={mockOnClose} onSave={mockOnSave} />
    );

    expect(screen.queryByPlaceholderText("Note title")).not.toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    render(
      <NoteEditor isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );

    const closeBtn = screen.getByRole("button", { name: /close note/i });
    fireEvent.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("allows typing in the title and content areas", async () => {
    const user = userEvent.setup();
    render(
      <NoteEditor isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );

    const titleInput = screen.getByPlaceholderText("Note title");
    const contentInput = screen.getByPlaceholderText(
      "Start typing your note..."
    );

    await user.type(titleInput, "My First Node Note");
    await user.type(contentInput, "This is the content of the node.");

    expect(titleInput).toHaveValue("My First Node Note");
    expect(contentInput).toHaveValue("This is the content of the node.");
  });

  it("has a rectangle placeholder for images and triggers file input on click", () => {
    render(
      <NoteEditor isOpen={true} onClose={mockOnClose} onSave={mockOnSave} />
    );

    const imagePlaceholder = screen.getByTestId("image-placeholder");
    expect(imagePlaceholder).toBeInTheDocument();

    const fileInput = screen.getByTestId("file-input");

    expect(fileInput).toHaveAttribute("type", "file");
    expect(fileInput).toHaveClass("hidden");
  });
});
