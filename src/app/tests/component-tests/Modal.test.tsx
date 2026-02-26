import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Modal from "../../components/Modal";

describe("Modal Component - UI Integration Tests", () => {
  const mockCloseWindow = vi.fn();

  beforeEach(() => {
    mockCloseWindow.mockClear();
  });

  afterEach(() => {
    cleanup(); // Ensures Portals are cleaned up
    document.body.innerHTML = ""; 
  });

  it("should render correctly when isVisible is true", async () => {
    render(
      <Modal isVisible={true} closeWindow={mockCloseWindow} title="Test Title">
        <div>Child Content</div>
      </Modal>
    );

    // Use findBy because of the 'mounted' state delay in useEffect
    const title = await screen.findByText("Test Title");
    const content = screen.getByText("Child Content");

    expect(title).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it("should call closeWindow when the backdrop is clicked", async () => {
    render(
      <Modal isVisible={true} closeWindow={mockCloseWindow} title="Title">
        <div>Content</div>
      </Modal>
    );

    // Wait for the modal to mount
    await screen.findByText("Title");

    // Target the backdrop (first div inside the portal)
    const backdrop = document.querySelector(".bg-black");
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockCloseWindow).toHaveBeenCalledTimes(1);
  });

  it("should NOT call closeWindow when the modal content is clicked", async () => {
    render(
      <Modal isVisible={true} closeWindow={mockCloseWindow} title="Title">
        <div data-testid="inner-content">Content</div>
      </Modal>
    );

    await screen.findByText("Title");
    const innerContent = screen.getByTestId("inner-content");

    fireEvent.click(innerContent);

    // Propagation should be stopped
    expect(mockCloseWindow).not.toHaveBeenCalled();
  });
});