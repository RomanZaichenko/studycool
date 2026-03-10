import { useState, useRef, FormEvent } from "react";
import ProjectDto from "../interfaces/ProjectDto";
import { useMainStore } from "@/store/useMainStore";

interface UseProjectFormProps {
  addProject: (projectData: ProjectDto) => void;
  closeWindow: () => void;
}

export function useProjectForm({
  addProject,
  closeWindow,
}: UseProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedMaps, setSelectedMaps] = useState<string[]>([]);
  const [mapSearch, setMapSearch] = useState("");
  const [isMapDropdownOpen, setIsMapDropdownOpen] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [filterSearch, setFilterSearch] = useState("");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const storedMaps = useMainStore((state) => state.maps || []);
  const storedFilters = useMainStore((state) => state.filters || []);

  const allMapNames = storedMaps.map(
    (map: { title?: string; name?: string } | string) =>
      typeof map === "string" ? map : map.title || map.name || ""
  );

  const availableMaps = allMapNames.filter(
    (mapName: string) =>
      mapName.toLowerCase().includes(mapSearch.toLowerCase()) &&
      !selectedMaps.includes(mapName)
  );

  const availableFilters = storedFilters.filter(
    (filter: string) =>
      filter.toLowerCase().includes(filterSearch.toLowerCase()) &&
      !selectedFilters.includes(filter)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
  };

  const handleAddMap = (mapName: string) => {
    setSelectedMaps((prev) => [...prev, mapName]);
    setMapSearch("");
    setIsMapDropdownOpen(false);
  };

  const handleRemoveMap = (mapToRemove: string) => {
    setSelectedMaps((prev) => prev.filter((map) => map !== mapToRemove));
  };

  const handleAddFilter = (filter: string) => {
    setSelectedFilters((prev) => [...prev, filter]);
    setFilterSearch("");
    setIsFilterDropdownOpen(false);
  };

  const handleRemoveFilter = (filterToRemove: string) => {
    setSelectedFilters((prev) =>
      prev.filter((filter) => filter !== filterToRemove)
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProject({
      title: name,
      description,
      iconName: fileName,
      isCustomIcon: !!fileName,
      filters: selectedFilters,
      maps: selectedMaps,
    });

    setName("");
    setDescription("");
    setFileName("");
    setSelectedMaps([]);
    setMapSearch("");
    setSelectedFilters([]);
    setFilterSearch("");
    closeWindow();
  };

  return {
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
  };
}
