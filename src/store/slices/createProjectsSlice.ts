import { StateCreator } from "zustand";
import Project from "@/app/interfaces/Project";
import ProjectDto from "@/app/interfaces/ProjectDto";

export const GENERAL_PROJECT_ID = "general-project";

export const defaultProject: Project = {
  id: GENERAL_PROJECT_ID,
  title: "General",
  description: "General folder for single maps",
  createdAt: new Date(),
  lastOpened: new Date(),
};

export interface ProjectsSlice {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (projectData: ProjectDto) => Promise<void>;
  updateProjectAccessTime: (id: string) => void;
}

export const createProjectsSlice: StateCreator<ProjectsSlice> = (set) => ({
  projects: [defaultProject],

  setProjects: (projects) =>
    set(() => {
      const filtered = projects.filter((p) => p.id !== GENERAL_PROJECT_ID);
      return {
        projects: [defaultProject, ...filtered],
      };
    }),

  addProject: async (projectData) => {
    const tempId = crypto.randomUUID();
    const newProject: Project = {
      id: tempId,
      title: projectData.title,
      createdAt: new Date(),
      lastOpened: new Date(),
      description: projectData.description,
      iconName: projectData.iconName,
      isCustomIcon: projectData.isCustomIcon,
      filters: projectData.filters,
    };

    set((state) => ({
      projects: [...state.projects, newProject],
    }));

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (res.ok) {
        const savedProject = await res.json();
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === tempId ? savedProject : p
          ),
        }));
      }
    } catch (e) {
      console.error("Помилка збереження проєкту в БД:", e);
    }
  },

  updateProjectAccessTime: (id: string) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, lastOpened: new Date() } : p
      ),
    })),
});
