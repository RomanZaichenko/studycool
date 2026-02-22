"use client";
import { useFilters } from "../hooks/useFilters";
import CheckIcon from "./CheckIcon";
import MinusIcon from "./MinusIcon";

export default function Filters() {
  const {
    filters,
    inputValue,
    selectedFilters,
    setInputValue,
    addFilter,
    removeFilter,
    toggleFilter,
  } = useFilters();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFilter();
  };

  return (
    <aside className="flex h-[85vh] max-w-sm flex-col rounded-lg bg-white p-5">
      <h2>Filters</h2>
      <div className="flex h-full flex-col justify-between overflow-hidden">
        <div className="custom-scrollbar flex flex-col overflow-y-auto pr-2">
          {filters.map((filter) => (
            <div
              key={filter}
              className="filter-item-container group mb-2 flex flex-row items-center justify-between"
            >
              <label className="relative flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  value={filter}
                  className="peer sr-only"
                  checked={selectedFilters.includes(filter)}
                  onChange={() => toggleFilter(filter)}
                />

                <div className="bg-primary-color peer-checked:bg-primary-color peer-hover:bg-primary-hover flex h-5 w-5 items-center justify-center rounded border-2 border-none transition-all duration-200 ease-in-out peer-checked:[&>svg]:opacity-100">
                  <CheckIcon />
                </div>

                <span className="font-victor text-ui-text-color text-2xl select-none">
                  {filter}
                </span>
              </label>

              <div
                className="remove-filter-icon mr-5 cursor-pointer opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                onClick={() => removeFilter(filter)}
              >
                <MinusIcon className="h-5 w-5 text-gray-400 hover:text-gray-500"/>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="shrink-0">
          <input
            className="font-victor border-ui-text-color placeholder:text-ui-text-color w-full rounded border-2 pl-1 text-lg"
            type="text"
            placeholder="Filter name"
            aria-label="Filter name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <button className="add-filters-button font-victor bg-primary-color hover:bg-primary-hover mt-3 w-full cursor-pointer rounded p-1 text-lg text-white underline-offset-2 transition-all duration-300 hover:shadow-md">
            Add filter
          </button>
        </form>
      </div>
    </aside>
  );
}
