import { StateCreator } from "zustand";

export interface FiltersSlice {
  filters: string[];
  selectedFilters: string[];
  addFilter: (filter: string) => void;
  removeFilter: (filter: string) => void;
  toggleFilter: (filter: string) => void;
}

export const createFilterSlice: StateCreator<FiltersSlice> = (set, get) => ({
  filters: [],
  selectedFilters: [],
  addFilter: (filter) => {
    const { filters } = get();
    const cleanValue = filter.trim();
    if (!cleanValue) return;

    const isDuplicate = filters.some(
      (filt) => filt.toLowerCase() === cleanValue.toLowerCase()
    );

    if (isDuplicate) return;

    set((state) => ({
      filters: [...state.filters, filter],
    }));
  },

  removeFilter: (filter) => {
    set((state) => ({
      filters: state.filters.filter((f) => f !== filter),
      selectedFilters: state.selectedFilters.filter((f) => f !== filter),
    }));
  },

  toggleFilter: (filter) => {
    set((state) => ({
      selectedFilters: state.selectedFilters.includes(filter)
        ? state.selectedFilters.filter((f) => f !== filter)
        : [...state.selectedFilters, filter],
    }))
  },
});
