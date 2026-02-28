"use client";
import { useRef, useState } from "react";
import ProjectDto from "../interfaces/ProjectDto";
import Modal from "./Modal"; // Шлях може відрізнятися

interface ProjectCreatorProps {
  closeWindow: () => void;
  isVisible: boolean;
  addProject: (projectData: ProjectDto ) => void;
}

export default function ProjectCreator({
  closeWindow,
  isVisible,
  addProject,
}: ProjectCreatorProps) {
  const [fileName, setFileName] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputStyles = `mt-3 bg-white rounded-xl border border-gray-300
        w-[93%] text-ui-text-color font-inter text-lg p-3 outline-none focus:border-primary-color transition-all duration-300`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
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
      },
    );

    setName("");
    setDescription("");
    setFileName("");
    closeWindow();
  };

  return (
    <Modal
      isVisible={isVisible}
      closeWindow={closeWindow}
      title="Create project"
    >
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
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
