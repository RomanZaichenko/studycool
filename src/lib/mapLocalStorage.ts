import { type Node, type Edge } from "@xyflow/react";

interface StoredMapData {
  nodes: Node[];
  edges: Edge[];
}

const storageKey = (mapId: string) => `map_data_${mapId}`;

export const getLocalMap = (mapId: string): StoredMapData | null => {
  const raw = localStorage.getItem(storageKey(mapId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return { nodes: parsed.nodes || [], edges: parsed.edges || [] };
  } catch (e) {
    console.error("Помилка парсингу локальних даних:", e);
    return null;
  }
};

export const setLocalMap = (mapId: string, data: StoredMapData): void => {
  localStorage.setItem(storageKey(mapId), JSON.stringify(data));
};
