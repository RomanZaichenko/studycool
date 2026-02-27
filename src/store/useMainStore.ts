import { create } from "zustand";
import { createFilterSlice, FiltersSlice } from "./slices/createFilterSlice";

type MainState = FiltersSlice

export const useMainStore = create<MainState>()((...args) => ({
  ...createFilterSlice(...args),
}));
