import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createFilterSlice, FiltersSlice } from "./slices/createFilterSlice";
import {
  createProjectsSlice,
  ProjectsSlice,
} from "./slices/createProjectsSlice";
import { createMapsSlice, MapsSlice } from "./slices/createMapsSlice";

type MainState = FiltersSlice &
  ProjectsSlice &
  MapsSlice & {
    fetchInitialData: () => Promise<void>;
    clearData: () => void;
  };

export const useMainStore = create<MainState>()(
  persist(
    (set, get, api) => ({
      ...createFilterSlice(set, get, api),
      ...createProjectsSlice(set, get, api),
      ...createMapsSlice(set, get, api),

      fetchInitialData: async () => {
        try {
          const [projectsRes, mapsRes] = await Promise.all([
            fetch("/api/projects"),
            fetch("/api/maps"),
          ]);

          if (projectsRes.ok && mapsRes.ok) {
            const projectsData = await projectsRes.json();
            const mapsData = await mapsRes.json();

            get().setProjects(projectsData);
            get().setMaps(mapsData);
          }
        } catch (error) {
          console.error("Помилка завантаження даних із бази:", error);
        }
      },

      clearData: () => {
        get().setProjects([]);
        get().setMaps([]);
      },
    }),
    {
      name: "knowledge-maps-storage",

      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
);
