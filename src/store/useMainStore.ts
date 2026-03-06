import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createFilterSlice, FiltersSlice } from "./slices/createFilterSlice";
import { createProjectsSlice, ProjectsSlice } from "./slices/createProjectsSlice";

import { createMapsSlice, MapsSlice } from "./slices/createMapsSlice";

type MainState = FiltersSlice & ProjectsSlice & MapsSlice

export const useMainStore = create<MainState>()(
  persist(
    (...args) => ({
      ...createFilterSlice(...args),
      ...createProjectsSlice(...args),
      ...createMapsSlice(...args),
    }),
    {
      name: "knowledge-maps-storage", 
    }
  )
);