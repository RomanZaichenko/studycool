import { useEffect, useRef } from "react";
import { type Node, type Edge } from "@xyflow/react";
import { setLocalMap } from "@/lib/mapLocalStorage";

type UpdateMapNodes = (id: string, nodes: Node[], edges: Edge[]) => void;

export const useAutoSaveMap = (
  currentMapId: string | null,
  nodes: Node[],
  edges: Edge[],
  updateMapNodes: UpdateMapNodes
) => {
  const lastLoadedMapId = useRef<string | null>(null);

  useEffect(() => {
    if (currentMapId === null) return;

    if (lastLoadedMapId.current !== currentMapId) {
      lastLoadedMapId.current = currentMapId;
      return;
    }

    setLocalMap(currentMapId, { nodes, edges });

    if (updateMapNodes) {
      updateMapNodes(currentMapId, nodes, edges);
    }
  }, [nodes, edges, currentMapId, updateMapNodes]);
};
