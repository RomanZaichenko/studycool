import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MapNode from "../../components/MapNode";

interface MockHandleProps {
  id: string;
  className?: string;
}

vi.mock("@xyflow/react", () => ({
  Handle: (props: MockHandleProps) => (
    <div data-testid={`handle-${props.id}`} className={props.className} />
  ),
  Position: {
    Right: "right",
    Left: "left",
    Top: "top",
    Bottom: "bottom",
  },
}));

type MapNodeProps = Parameters<typeof MapNode>[0];

const createNodeProps = (level: 1 | 2 | 3, label: string): MapNodeProps => {
  return {
    id: "test-node-1",
    data: { label, level },
    selected: false,
    type: "customMapNode",
    dragging: false,
    zIndex: 0,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
  } as MapNodeProps;
};

describe("MapNode Component - Visual Logic Tests", () => {
  it("should render the correct text label", () => {
    render(<MapNode {...createNodeProps(1, "React Basics")} />);
    
    expect(screen.getByText("React Basics")).toBeInTheDocument();
  });

  describe("Level Styles", () => {
    it("should apply Level 1 styles correctly", () => {
      const { container } = render(<MapNode {...createNodeProps(1, "Level 1 Node")} />);
      const nodeContainer = container.firstChild as HTMLElement;

      expect(nodeContainer).toHaveClass("text-2xl");
      expect(nodeContainer).toHaveClass("bg-[var(--node-bg-1)]");
      expect(nodeContainer).toHaveClass("border-3");
    });

    it("should apply Level 2 styles correctly", () => {
      const { container } = render(<MapNode {...createNodeProps(2, "Level 2 Node")} />);
      const nodeContainer = container.firstChild as HTMLElement;

      expect(nodeContainer).toHaveClass("text-xl");
      expect(nodeContainer).toHaveClass("bg-[var(--node-bg-2)]");
      expect(nodeContainer).toHaveClass("border-2");
    });

    it("should apply Level 3 styles correctly", () => {
      const { container } = render(<MapNode {...createNodeProps(3, "Level 3 Node")} />);
      const nodeContainer = container.firstChild as HTMLElement;

      expect(nodeContainer).toHaveClass("text-lg");
      expect(nodeContainer).toHaveClass("bg-[#F9F8FC]");
      expect(nodeContainer).toHaveClass("border");
    });
  });

  describe("Handles Configuration", () => {
    it("should render exactly 12 handles for connections", () => {
      render(<MapNode {...createNodeProps(1, "Test")} />);
      
      const handles = screen.getAllByTestId(/handle-/);
      expect(handles).toHaveLength(12);
    });

    it("should render specific handles (e.g., top-middle, bottom-right)", () => {
      render(<MapNode {...createNodeProps(1, "Test")} />);
      
      expect(screen.getByTestId("handle-rtc")).toBeInTheDocument(); // Right Top Corner
      expect(screen.getByTestId("handle-bml")).toBeInTheDocument(); // Bottom Middle Left
      expect(screen.getByTestId("handle-ltc")).toBeInTheDocument(); // Left Top Corner
    });
  });
});