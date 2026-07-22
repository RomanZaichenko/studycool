import { StateCreator } from "zustand";
import Map from "@/app/interfaces/Map";
import MapDto from "@/app/interfaces/MapDto";
import { GENERAL_PROJECT_ID } from "./createProjectsSlice";
import { Node as FlowNode } from "@xyflow/react";

export interface MapsSlice {
  maps: Map[];
  setMaps: (maps: Map[]) => void;
  addMap: (projectData: MapDto) => Promise<void>;
  updateMapAccessTime: (id: string) => void;
  updateMapNodes: (id: string, nodes: FlowNode[]) => void;
}

export const createMapsSlice: StateCreator<MapsSlice> = (set) => ({
  maps: [],

  setMaps: (maps) => set({ maps }),

  addMap: async (mapData) => {
    const tempId = crypto.randomUUID();

    const newMap: Map = {
      id: tempId,
      projectId: mapData.projectId ?? GENERAL_PROJECT_ID,
      title: mapData.title,
      description: mapData.description,
      createdAt: new Date(),
      lastOpened: new Date(),
      miniMapIcon: undefined,
    };

    set((state) => ({
      maps: [newMap, ...state.maps],
    }));

    try {
      await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: tempId,
          title: mapData.title,
          description: mapData.description,
          projectId:
            mapData.projectId === GENERAL_PROJECT_ID ? null : mapData.projectId,
        }),
      });
    } catch (e) {
      console.error("Помилка збереження мапи в БД:", e);
    }
  },

  updateMapAccessTime: (id: string) => {
    set((state) => ({
      maps: state.maps.map((map) =>
        map.id === id ? { ...map, lastOpened: new Date() } : map
      ),
    }));

    fetch(`/api/maps/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).catch((e) => console.error(e));
  },

  updateMapNodes: (mapId, nodes) => {
    set((state) => ({
      maps: state.maps.map((m) =>
        m.id === mapId ? { ...m, nodes: nodes } : m
      ),
    }));

    fetch(`/api/maps/${mapId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes }),
    }).catch((e) => console.error(e));
  },
});
