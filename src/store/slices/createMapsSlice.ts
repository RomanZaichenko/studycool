import { StateCreator } from "zustand";
import Map from "@/app/interfaces/Map";
import MapDto from "@/app/interfaces/MapDto";
import { GENERAL_PROJECT_ID } from "./createProjectsSlice";

export interface MapsSlice {
  maps: Map[];
  addMap: (projectData : MapDto) => void;
  updateMapAccessTime: (id: number) => void;
}

export const createMapsSlice: StateCreator<MapsSlice> = (set) => ({
  maps: [],
  addMap: (mapData) => {
    const newMap: Map = {
          id: Date.now(),
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

  updateMapAccessTime: (id : number) => 
    set((state) => ({
      maps: state.maps.map(map => 
        map.id === id ? { ...map, lastOpened: new Date() } : map
      )
    })), 
});
