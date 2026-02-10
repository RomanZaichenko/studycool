"use client"

import {useRef, useState, useEffect} from "react";
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
  const [isProjectVisible, setIsProjectVisible] = useState<boolean>(false)


  const addProject = ({projectData}: {projectData: ProjectDto}) => {
    const newProject: Project = {
      id: Date.now(),
      title: projectData.title,
      createdAt: new Date(),
      lastOpened: new Date(),
      description: projectData.description,
      iconName: projectData.iconName,
      isCustomIcon: projectData.isCustomIcon,
      filters: projectData.filters
    };

    const newProjects = [...projects, newProject];
    setProjects(newProjects);
    setIsProjectVisible(false);
  }

  return (
    <SectionWrapper title="Projects" isLineShown={false}>
      <AddButton handleClick={() => setIsProjectVisible(true)} />

      {projects.map((project) => (
        <Link href={`/project-area/${project.id}`} key={project.id}>
          <div className="mr-5 mb-5 cursor-pointer">
            <Card title={project.title}>
              <Image 
                src="/"
                width={200}
                height={105}
                alt={"Project Image"}
                style ={{
                  fontSize: "12px",
                  marginRight: "5px",
                }}
              />
            </Card>
          </div>
        </Link>
      ))}

      <ProjectCreator isVisible={isProjectVisible} 
              closeWindow={() => setIsProjectVisible(false)}
              addProject = {addProject}/>
    </SectionWrapper>

  )
}