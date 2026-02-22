import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Node, Edge, Connection } from "@xyflow/react";
import {
  useMapLogic,
  propagateLevelChange,
  idTranslate,
} from "../../hooks/useMapLogic";

const mockGetEdges = vi.fn();
const mockScreenToFlowPosition = vi.fn((pos) => pos);

vi.mock("@xyflow/react", async () => {
  const actual = await vi.importActual("@xyflow/react");
  return {
    ...actual,
    useReactFlow: () => ({
      getEdges: mockGetEdges,
      screenToFlowPosition: mockScreenToFlowPosition,
    }),
  };
});

vi.stubGlobal("crypto", {
  randomUUID: () => "12345678-abcd-1234-abcd-1234567890ab",
});

describe("useMapLogic - Unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // Pure exports
  // ==========================================

  describe("idTranslate [handles dictionary]", () => {
    it("have to correctly translate handles", () => {
      expect(idTranslate["rtc"]).toBe("l");
      expect(idTranslate["ltc"]).toBe("r");
      expect(idTranslate["bml"]).toBe("t");
      expect(idTranslate["tml"]).toBe("b");
    });
  });

  describe("propagateLevelChange", () => {
    const nodes: Node[] = [
      { id: "1", position: { x: 0, y: 0 }, data: { level: 1 } },
      { id: "2", position: { x: 0, y: 0 }, data: { level: 1 } },
      { id: "3", position: { x: 0, y: 0 }, data: { level: 1 } },
    ];

    it("have to change node level", () => {
      const result = propagateLevelChange("1", 2, nodes, []);
      expect(result.find((n) => n.id === "1")?.data.level).toBe(2);
      expect(result.find((n) => n.id === "2")?.data.level).toBe(1); // не змінився
    });

    it("have to respect level limit of 3", () => {
      const result = propagateLevelChange("1", 5, nodes, []);
      expect(result.find((n) => n.id === "1")?.data.level).toBe(3);
    });

    it("have to recursively update children", () => {
      const edges: Edge[] = [
        { id: "e1", source: "1", target: "2" },
        { id: "e2", source: "2", target: "3" },
      ];
      const result = propagateLevelChange("2", 2, nodes, edges);
      expect(result.find((n) => n.id === "2")?.data.level).toBe(2);
      expect(result.find((n) => n.id === "3")?.data.level).toBe(3);
    });
  });

  // ==========================================
  // useMapLogic testing itself
  // ==========================================

  describe("isValidConnection", () => {
    const mockConn = (source: string, target: string): Connection => ({
      source,
      target,
      sourceHandle: null,
      targetHandle: null,
    });

    it("have to forbid connection of node with itself", () => {
      const { result } = renderHook(() => useMapLogic());

      const isValid = result.current.isValidConnection(mockConn("A", "A"));
      expect(isValid).toBe(false);
    });

    it("have to forbid duplicates (direct and reverse)", () => {
      mockGetEdges.mockReturnValue([{ source: "A", target: "B" }]);
      const { result } = renderHook(() => useMapLogic());

      expect(result.current.isValidConnection(mockConn("A", "B"))).toBe(false);

      expect(result.current.isValidConnection(mockConn("B", "A"))).toBe(false);
    });

    it("have to allow unique connections", () => {
      mockGetEdges.mockReturnValue([{ source: "A", target: "B" }]);
      const { result } = renderHook(() => useMapLogic());

      expect(result.current.isValidConnection(mockConn("A", "C"))).toBe(true);
    });
  });

  describe("Node and edges states", () => {
    it("have to add new node onPaneContextMenu", () => {
      const { result } = renderHook(() => useMapLogic());

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.onPaneContextMenu(mockEvent);
      });

      expect(result.current.nodes.length).toBe(1);
      expect(result.current.nodes[0].data.label).toBe("New node");
      expect(result.current.nodes[0].data.level).toBe(1);
      expect(mockScreenToFlowPosition).toHaveBeenCalledWith({ x: 100, y: 200 });
    });

    it("have to keep initial empty arrays", () => {
      const { result } = renderHook(() => useMapLogic());
      expect(result.current.nodes).toEqual([]);
      expect(result.current.edges).toEqual([]);
    });
  });
});