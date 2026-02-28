import {
  Connection,
  useReactFlow,
  OnConnectStartParams,
  Edge,
} from "@xyflow/react";
import { useCallback, useRef } from "react";
import { useMapEditorStore } from "@/store/useMapEditorStore";
import MapNode from "../components/MapNode";

export const idTranslate: Record<string, string> = {
  rtc: "l",
  r: "l",
  rbc: "l",
  bml: "t",
  bmr: "t",
  b: "t",
  ltc: "r",
  l: "r",
  lbc: "r",
  tml: "b",
  tmr: "b",
  t: "b",
};

export function useMapLogic() {
  const { screenToFlowPosition, getEdges } = useReactFlow();
  const connectionStartRef = useRef<OnConnectStartParams | null>(null);

  const nodeTypes = {
    mapNode: MapNode,
  };

  const addNodeAtPosition = useMapEditorStore(
    (state) => state.addNodeAtPosition
  );
  const createNodeFromConnection = useMapEditorStore(
    (state) => state.createNodeFromConnection
  );

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (connection.source === connection.target) return false;
      const currentEdges = getEdges();

      return !currentEdges.some((edge) => {
        const isDirect =
          edge.source === connection.source &&
          edge.target === connection.target;
        const isReverse =
          edge.source === connection.target &&
          edge.target === connection.source;
        return isReverse || isDirect;
      });
    },
    [getEdges]
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNodeAtPosition(position);
    },
    [screenToFlowPosition, addNodeAtPosition]
  );

  const onConnectStart = useCallback(
    (event: MouseEvent | TouchEvent, params: OnConnectStartParams) => {
      connectionStartRef.current = params;
    },
    []
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;
      const isPane = target.classList.contains("react-flow__pane");

      if (isPane && connectionStartRef.current) {
        const { nodeId, handleType, handleId } = connectionStartRef.current;
        connectionStartRef.current = null;

        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const position = screenToFlowPosition({ x: clientX, y: clientY });

        const endHandleId = idTranslate[handleId as string];

        // Делегуємо всю важку логіку (рівні, грані) у Zustand
        createNodeFromConnection(
          position,
          nodeId!,
          handleType!,
          handleId!,
          endHandleId
        );
      }
    },
    [screenToFlowPosition, createNodeFromConnection]
  );

  return {
    isValidConnection,
    onPaneContextMenu,
    onConnectStart,
    onConnectEnd,
    nodeTypes,
  };
}
