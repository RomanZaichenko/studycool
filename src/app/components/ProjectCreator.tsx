"use client";
import { useRef, useState } from "react";
import ProjectDto from "../interfaces/ProjectDto";
import Modal from "./Modal";
import { useMainStore } from "@/store/useMainStore"; // <-- Імпортуємо ваш стор

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
  const [fileName, setFileName] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Стани для мульти-вибору мап
  const [selectedMaps, setSelectedMaps] = useState<string[]>([]);
  const [mapSearch, setMapSearch] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- БЕРЕМО РЕАЛЬНІ МАПИ ЗІ СТОРУ ---
  const storedMaps = useMainStore((state) => state.maps || []);

  // Отримуємо масив назв мап.
  // (Якщо ваші мапи мають інше поле для назви, наприклад, map.name, змініть map.title на map.name)
  // Описуємо можливий тип мапи: або рядок, або об'єкт із полями title/name
  const allMapNames = storedMaps.map(
    (map: { title?: string; name?: string } | string) =>
      typeof map === "string" ? map : map.title || map.name || ""
  );

  const inputStyles = `mt-3 bg-white rounded-xl border border-gray-300
        w-[93%] text-ui-text-color font-inter text-lg p-3 outline-none focus:border-primary-color transition-all duration-300`;

  // Фільтруємо реальні мапи: шукаємо за текстом і відкидаємо ті, що вже обрані
  const availableMaps = allMapNames.filter(
    (mapName: string) =>
      mapName.toLowerCase().includes(mapSearch.toLowerCase()) &&
      !selectedMaps.includes(mapName)
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
    setIsDropdownOpen(false);
  };

  const handleRemoveMap = (mapToRemove: string) => {
    setSelectedMaps((prev) => prev.filter((map) => map !== mapToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProject({
      title: name,
      description,
      iconName: fileName,
      isCustomIcon: !!fileName,
      filters: [],
      maps: selectedMaps,
    });

    // Очищення полів
    setName("");
    setDescription("");
    setFileName("");
    setSelectedMaps([]);
    setMapSearch("");
    closeWindow();
  };

  return (
    <Modal
      isVisible={isVisible}
      closeWindow={closeWindow}
      title="Create project"
    >
      <form onSubmit={handleSubmit} className="flex flex-col items-center pb-4">
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

        {/* --- Вибір іконки --- */}
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

        {/* --- Мульти-вибір мап --- */}
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
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setIsDropdownOpen(false)}
          />

          {/* Випадаючий список з РЕАЛЬНИМИ мапами */}
          {isDropdownOpen && availableMaps.length > 0 && (
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

          {/* Відображення обраних мап (Теги) */}
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

        {/* Поле фільтра */}
        <input
          className={`${inputStyles} mt-7`}
          type="text"
          placeholder="Enter filter..."
        />

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
