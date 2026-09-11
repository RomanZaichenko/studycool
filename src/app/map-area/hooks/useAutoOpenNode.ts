import { useEffect, useRef } from "react";
import { type Node } from "@xyflow/react";

type SetCenter = (
  x: number,
  y: number,
  opts?: { zoom?: number; duration?: number }
) => void;

export const useAutoOpenNode = (
  openNodeId: string | null,
  nodes: Node[],
  openNoteEditor: (id: string) => void,
  setCenter: SetCenter
) => {
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (openNodeId && nodes.length > 0 && !hasAutoOpened.current) {
      const targetNode = nodes.find((n) => n.id === openNodeId);
      if (targetNode) {
        openNoteEditor(openNodeId);
        setCenter(targetNode.position.x, targetNode.position.y, {
          zoom: 1.5,
          duration: 800,
        });
        hasAutoOpened.current = true;
      }
    }
  }, [openNodeId, nodes, openNoteEditor, setCenter]);
};
