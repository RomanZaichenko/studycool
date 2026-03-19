import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { Connection } from "@xyflow/react";
import { useMapLogic, idTranslate } from "../../hooks/useMapLogic";

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

const mockAddNodeAtPosition = vi.fn();
const mockCreateNodeFromConnection = vi.fn();

vi.mock("@/store/useMapEditorStore", () => ({
  useMapEditorStore: (
    selector: (state: {
      addNodeAtPosition: typeof mockAddNodeAtPosition;
      createNodeFromConnection: typeof mockCreateNodeFromConnection;
    }) => unknown
  ) => {
    const state = {
      addNodeAtPosition: mockAddNodeAtPosition,
      createNodeFromConnection: mockCreateNodeFromConnection,
    };
    return selector(state);
  },
}));

describe("useMapLogic - Unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("idTranslate [handles dictionary]", () => {
    it("have to correctly translate handles", () => {
      expect(idTranslate["rtc"]).toBe("l");
      expect(idTranslate["ltc"]).toBe("r");
      expect(idTranslate["bml"]).toBe("t");
      expect(idTranslate["tml"]).toBe("b");
    });
  });

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

  describe("Node creation interactions", () => {
    it("have to call addNodeAtPosition onPaneContextMenu", () => {
      const { result } = renderHook(() => useMapLogic());

      const mockEvent = {
        preventDefault: vi.fn(),
        clientX: 100,
        clientY: 200,
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.onPaneContextMenu(mockEvent);
      });

      expect(mockScreenToFlowPosition).toHaveBeenCalledWith({ x: 100, y: 200 });

      expect(mockAddNodeAtPosition).toHaveBeenCalledWith({ x: 100, y: 200 });
    });
  });
});
