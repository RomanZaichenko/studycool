import { StateCreator } from "zustand";
import Map from "@/app/interfaces/Map";
import MapDto from "@/app/interfaces/MapDto";

export interface MapsSlice {
  maps: Map[];
  addMap: (projectData : MapDto) => void;
}

export const createMapsSlice: StateCreator<MapsSlice> = (set) => ({
  maps: [],
  addMap: (mapData) => {
    const newMap: Map = {
          id: Date.now(),
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
});
