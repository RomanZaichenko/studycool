import { create } from "zustand";
import { createFilterSlice, FiltersSlice } from "./slices/createFilterSlice";
import { createProjectsSlice, ProjectsSlice } from "./slices/createProjectsSlice";
import { createMapsSlice, MapsSlice } from "./slices/createMapsSlice";

type MainState = FiltersSlice & ProjectsSlice & MapsSlice

export const useMainStore = create<MainState>()((...args) => ({
  ...createFilterSlice(...args),
  ...createProjectsSlice(...args),
  ...createMapsSlice(...args)
}));
