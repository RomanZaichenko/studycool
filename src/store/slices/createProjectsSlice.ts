import { StateCreator } from "zustand";
import Project from "@/app/interfaces/Project";
import ProjectDto from "@/app/interfaces/ProjectDto";

export const GENERAL_PROJECT_ID = 0;

export const defaultProject: Project = {
  id: GENERAL_PROJECT_ID,
  title: "General",
  description: "General folder for single maps",
  createdAt: new Date(),
  lastOpened: new Date(),
};
export interface ProjectsSlice {
  projects: Project[];
  addProject: (projectData: ProjectDto) => void;
}

export const createProjectsSlice: StateCreator<ProjectsSlice> = (set) => ({
  projects: [defaultProject],
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
      projects: [newProject, ...state.projects],
    }));
  },

  updateProjectAccessTime: (id: number) => 
    set((state) => ({
      projects: state.projects.map(p => 
        p.id === id ? { ...p, lastOpened: new Date() } : p
      )
    })),
});
