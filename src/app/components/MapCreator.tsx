"use client";
import { useState } from "react";
import MapDto from "../interfaces/MapDto";
import Modal from "./Modal";
import { useMainStore } from "@/store/useMainStore";
import { GENERAL_PROJECT_ID } from "@/store/slices/createProjectsSlice";

interface MapCreatorProps {
  closeWindow: () => void;
  isVisible: boolean;
  addMap: ({ mapData }: { mapData: MapDto }) => void;
}

export default function MapCreator({
  closeWindow,
  isVisible,
  addMap,
}: MapCreatorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] =
    useState<number>(GENERAL_PROJECT_ID);

  const projects = useMainStore((state) => state.projects);

  const inputStyles = `mt-3 bg-white rounded-xl border border-gray-300
        w-[93%] text-ui-text-color font-inter text-lg p-3 outline-none focus:border-primary-color transition-all duration-300`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addMap({ mapData: { title, description, projectId: selectedProjectId } });

    setTitle("");
    setDescription("");
    setSelectedProjectId(GENERAL_PROJECT_ID);
    closeWindow()
  };

  return (
    <Modal isVisible={isVisible} closeWindow={closeWindow} title="Create map">
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <input
          className={inputStyles}
          type="text"
          placeholder="Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={`${inputStyles} field-sizing-content max-h-[50vh] min-h-[120px] resize-none`}
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className={inputStyles}
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(Number(e.target.value))}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title === "General" ? "General" : project.title}
            </option>
          ))}
        </select>

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
