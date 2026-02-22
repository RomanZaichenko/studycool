import { useState } from "react";

export function useFilters() {
  const [filters, setFilters] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const addFilter = () => {
    const cleanValue = inputValue.trim();
    if (!cleanValue) return;

    const isDuplicate = filters.some(
      (filt) => filt.toLowerCase() === cleanValue.toLowerCase()
    );

    if (isDuplicate) {
      setInputValue("");
      return;
    }

    setFilters((prev) => [...prev, cleanValue]);
    setInputValue("");
  };

  const removeFilter = (filterToRemove: string) => {
    setFilters((prev) => prev.filter((filt) => filt !== filterToRemove));
    setSelectedFilters((prev) =>
      prev.filter((filt) => filt !== filterToRemove)
    );
  };

  const toggleFilter = (filterToToggle: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterToToggle)
        ? prev.filter((f) => f !== filterToToggle)
        : [...prev, filterToToggle]
    );
  };

  return {
    filters,
    inputValue,
    selectedFilters,
    setInputValue,
    addFilter,
    removeFilter,
    toggleFilter,
  };
}
