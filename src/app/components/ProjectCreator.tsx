"use client";
import ProjectDto from "../interfaces/ProjectDto";
import Modal from "./Modal";
import { useProjectForm } from "../hooks/useProjectForm"; // Зміни шлях, якщо потрібно

interface ProjectCreatorProps {
  closeWindow: () => void;
  isVisible: boolean;
  addProject: (projectData: ProjectDto) => void;
}

export default function ProjectCreator({
  closeWindow,
  isVisible,
  addProject,
}: ProjectCreatorProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    fileName,
    fileInputRef,
    handleFileChange,
    selectedMaps,
    mapSearch,
    setMapSearch,
    isMapDropdownOpen,
    setIsMapDropdownOpen,
    availableMaps,
    handleAddMap,
    handleRemoveMap,
    selectedFilters,
    filterSearch,
    setFilterSearch,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
    availableFilters,
    handleAddFilter,
    handleRemoveFilter,
    handleSubmit,
  } = useProjectForm({ addProject, closeWindow });

  const inputStyles = `mt-3 bg-white rounded-xl border border-gray-300
        w-[93%] text-ui-text-color font-inter text-lg p-3 outline-none focus:border-primary-color transition-all duration-300`;

  return (
    <Modal
      isVisible={isVisible}
      closeWindow={closeWindow}
      title="Create project"
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[75vh] w-full flex-col items-center overflow-y-auto pb-4"
      >
        <input
          className={inputStyles}
          type="text"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <textarea
          className={`${inputStyles} field-sizing-content max-h-[50vh] min-h-[120px] resize-none`}
          placeholder="Description"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />

        <div className="mt-5 flex w-[93%] flex-col">
          <label className="font-inter text-ui-text-color ml-1 font-bold">
            Choose icon
          </label>
        </div>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="font-inter mt-2 w-[93%] cursor-pointer rounded-xl border-2 border-dashed border-gray-300 bg-white p-3 text-center text-lg transition-colors hover:bg-gray-50"
        >
          {fileName ? (
            <p className="text-primary-color truncate font-semibold">
              {fileName}
            </p>
          ) : (
            <p className="text-ui-text-color truncate opacity-50">
              Choose from files...
            </p>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="relative mt-5 flex w-[93%] flex-col">
          <label className="font-inter text-ui-text-color ml-1 font-bold">
            Add maps
          </label>

          <input
            type="text"
            className={inputStyles}
            placeholder="Search and add maps..."
            value={mapSearch}
            onChange={(e) => {
              setMapSearch(e.target.value);
              setIsMapDropdownOpen(true);
            }}
            onFocus={() => setIsMapDropdownOpen(true)}
            onBlur={() => setIsMapDropdownOpen(false)}
          />

          {isMapDropdownOpen && availableMaps.length > 0 && (
            <div className="absolute top-[85px] left-[3.5%] z-10 max-h-48 w-[93%] overflow-y-auto rounded-xl border border-gray-300 bg-white shadow-lg">
              {availableMaps.map((mapName: string, index: number) => (
                <div
                  key={index}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAddMap(mapName);
                  }}
                  className="font-inter text-ui-text-color hover:text-primary-color cursor-pointer p-3 transition-colors hover:bg-gray-100"
                >
                  {mapName}
                </div>
              ))}
            </div>
          )}

          {selectedMaps.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedMaps.map((map, idx) => (
                <div
                  key={idx}
                  className="font-inter text-ui-text-color flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-1 text-sm"
                >
                  <span>{map}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMap(map)}
                    className="font-bold text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative mt-5 flex w-[93%] flex-col">
          <label className="font-inter text-ui-text-color ml-1 font-bold">
            Add filters
          </label>

          <input
            type="text"
            className={inputStyles}
            placeholder="Search and add filters..."
            value={filterSearch}
            onChange={(e) => {
              setFilterSearch(e.target.value);
              setIsFilterDropdownOpen(true);
            }}
            onFocus={() => setIsFilterDropdownOpen(true)}
            onBlur={() => setIsFilterDropdownOpen(false)}
          />

          {isFilterDropdownOpen && availableFilters.length > 0 && (
            <div className="absolute top-[85px] left-[3.5%] z-10 max-h-48 w-[93%] overflow-y-auto rounded-xl border border-gray-300 bg-white shadow-lg">
              {availableFilters.map((filter: string, index: number) => (
                <div
                  key={index}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAddFilter(filter);
                  }}
                  className="font-inter text-ui-text-color hover:text-primary-color cursor-pointer p-3 transition-colors hover:bg-gray-100"
                >
                  {filter}
                </div>
              ))}
            </div>
          )}

          {selectedFilters.length > 0 && (
            <div className="mt-3 flex w-[93%] flex-wrap gap-2">
              {selectedFilters.map((filter, idx) => (
                <div
                  key={idx}
                  className="font-inter text-ui-text-color flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-1 text-sm"
                >
                  <span>{filter}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFilter(filter)}
                    className="font-bold text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="font-inter bg-primary-color hover:bg-primary-hover mt-6 mb-3 w-[93%] cursor-pointer rounded p-2 text-2xl font-bold text-white transition-all duration-300 hover:shadow-md active:scale-95"
          type="submit"
        >
          Create
        </button>
      </form>
    </Modal>
  );
}
