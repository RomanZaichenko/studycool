import { StateCreator } from "zustand";
import Project from "@/app/interfaces/Project";
import ProjectDto from "@/app/interfaces/ProjectDto";

export interface ProjectsSlice {
  projects: Project[];
  addProject: (projectData : ProjectDto) => void;
}

export const createProjectsSlice: StateCreator<ProjectsSlice> = (set) => ({
  projects: [],
  addProject: (projectData) => {
    const newProject: Project = {
      id: Date.now(),
      title: projectData.title,
      createdAt: new Date(),
      lastOpened: new Date(),
      description: projectData.description,
      iconName: projectData.iconName,
      isCustomIcon: projectData.isCustomIcon,
      filters: projectData.filters,
    };

    set((state) => ({
      projects: [newProject, ...state.projects]
    }))
  },
});
