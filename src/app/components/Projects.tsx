"use client";

import { useState, useMemo } from "react";
import Card from "./Card";
import ProjectCreator from "./ProjectCreator";
import SectionWrapper from "./SectionWrapper";
import AddButton from "./AddButton";
import Image from "next/image";
import Link from "next/link";
import { useMainStore } from "@/store/useMainStore";
import Project from "../interfaces/Project";
import SortDropdown, { SortOption } from "./SortDropdown";

export default function Projects() {
  const projects = useMainStore((state) => state.projects);
  const addProject = useMainStore((state) => state.addProject);
  const selectedFilters = useMainStore((state) => state.selectedFilters);

  const [isCreatorVisible, setIsCreatorVisible] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const filteredProjects = useMemo(() => {
    if (selectedFilters.length === 0) return projects;
    return projects.filter((project) =>
      selectedFilters.some((filter) => project.filters?.includes(filter))
    );
  }, [projects, selectedFilters]);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a: Project, b: Project) => {
      if (a.title === "General" || a.title === "Загальний") return 1;
      if (b.title === "General" || b.title === "Загальний") return -1;

      switch (sortBy) {
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "newest":
        case "recent":
          return b.id - a.id;
        case "oldest":
          return a.id - b.id;
        default:
          return b.id - a.id;
      }
    });
  }, [filteredProjects, sortBy]);

  return (
    <SectionWrapper
      title="Projects"
      isLineShown={false}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      headerControls={<SortDropdown value={sortBy} onChange={setSortBy} />}
    >
      <div className="flex w-full flex-wrap items-start gap-4 sm:gap-6">
        <AddButton
          onClick={() => setIsCreatorVisible(true)}
          aria-label="Create new project"
        />

        {sortedProjects.map((project: Project) => (
          <Link
            href={`/project-area/${project.id}`}
            key={project.id}
            className="block max-w-full cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Card title={project.title}>
              <div className="relative h-[105px] w-[200px] max-w-full sm:w-[200px]">
                <Image
                  src={
                    project.iconName
                      ? `/icons/${project.iconName}`
                      : "/default-placeholder.svg"
                  }
                  fill
                  alt={project.title}
                  className="rounded object-cover text-xs"
                />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <ProjectCreator
        isVisible={isCreatorVisible}
        closeWindow={() => setIsCreatorVisible(false)}
        addProject={addProject}
      />
    </SectionWrapper>
  );
}
