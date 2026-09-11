import { useEffect } from "react";
import { type Node, type Edge } from "@xyflow/react";
import { getLocalMap, setLocalMap } from "@/lib/mapLocalStorage";
import { useMapEditorStore } from "@/store/useMapEditorStore";
import { useMainStore } from "@/store/useMainStore";

export const useLoadMapData = (mapId: string | undefined) => {
  const loadMapData = useMapEditorStore((state) => state.loadMapData);
  const resetMap = useMapEditorStore((state) => state.resetMap);
  const updateLastOpened = useMainStore((state) => state.updateMapAccessTime);

  useEffect(() => {
    if (!mapId) return;
    updateLastOpened(mapId);

    const fetchAndLoadMap = async () => {
      let fetchedNodes: Node[] = [];
      let fetchedEdges: Edge[] = [];

      const localData = getLocalMap(mapId);
      if (localData) {
        fetchedNodes = localData.nodes;
        fetchedEdges = localData.edges;
      }

      try {
        const response = await fetch(`/api/maps/${mapId}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const dbMap = await response.json();
          if (dbMap.nodes) fetchedNodes = dbMap.nodes;
          if (dbMap.edges) fetchedEdges = dbMap.edges;

          setLocalMap(mapId, { nodes: fetchedNodes, edges: fetchedEdges });
        }
      } catch (e) {
        console.error("Помилка завантаження з БД:", e);
      }

      loadMapData(mapId, fetchedNodes, fetchedEdges);
    };

    fetchAndLoadMap();

    return () => resetMap();
  }, [mapId, loadMapData, resetMap, updateLastOpened]);
};
