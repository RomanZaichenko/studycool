import { StateCreator } from "zustand";
import Map from "@/app/interfaces/Map";
import MapDto from "@/app/interfaces/MapDto";
import { GENERAL_PROJECT_ID } from "./createProjectsSlice";
import { Node as FlowNode } from "@xyflow/react";

export interface MapsSlice {
  maps: Map[];
  addMap: (projectData : MapDto) => void;
  updateMapAccessTime: (id: string) => void;
  updateMapNodes: (id: string, nodes: FlowNode[]) => void; 
}

export const createMapsSlice: StateCreator<MapsSlice> = (set) => ({
  maps: [],
  addMap: (mapData) => {
    const newMap: Map = {
          id: crypto.randomUUID(),
          projectId: mapData.projectId ?? GENERAL_PROJECT_ID,
          title: mapData.title,
          description: mapData.description,
          createdAt: new Date(),
          lastOpened: new Date(),
          miniMapIcon: undefined,
        };

    set((state) => ({
      maps: [newMap, ...state.maps]
    }))
  },

  updateMapAccessTime: (id : string) => 
    set((state) => ({
      maps: state.maps.map(map => 
        map.id === id ? { ...map, lastOpened: new Date() } : map
      )
    })), 

  updateMapNodes: (mapId, nodes) => {
    set((state) => ({
      maps: state.maps.map((m) =>
        m.id === mapId ? { ...m, nodes: nodes } : m
      ),
    }));
  },
});