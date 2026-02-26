"use client";

import { useState } from "react";
import Project from "../interfaces/Project";
import Card from "./Card";
import ProjectDto from "../interfaces/ProjectDto";
import ProjectCreator from "./ProjectCreator";
import SectionWrapper from "./SectionWrapper";
import AddButton from "./AddButton";
import Image from "next/image";
import Link from "next/link";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreatorVisible, setIsCreatorVisible] = useState<boolean>(false);

  const addProject = ({ projectData }: { projectData: ProjectDto }) => {
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

    setProjects((prevProjects) => [newProject, ...prevProjects]);
    setIsCreatorVisible(false);
  };

  return (
    <SectionWrapper title="Projects" isLineShown={false}>
      <div className="mt-4 flex flex-wrap items-start justify-center gap-4 sm:justify-start sm:gap-6">
        <AddButton onClick={() => setIsCreatorVisible(true)}
          aria-label="Create new project"/>

        {projects.map((project) => (
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
