"use client"

import {useRef, useState, useEffect} from "react";
import Project from "../interfaces/Project";
import ProjectCard from "./ProjectCard";
import ProjectDto from "../interfaces/ProjectDto";
import ProjectCreator from "./ProjectCreator";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isShownVariants, setIsShownVariants] = useState<boolean>(false)
  const [isProjectVisible, setIsProjectVisible] = useState<boolean>(false)

  const showAdditionVariants = () => {
    setIsShownVariants(true);
  }

  const hideAdditionVariants = () => {
    setIsShownVariants(false);
  }

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
    <section className="projects ml-9 mt-9 text-6xl">
      <h2>Projects</h2>
    
      <div className="projects-items flex">
        <div className="button relative">
          <button onClick={() => setIsProjectVisible(true)}
            className="add-button cursor-pointer bg-white pl-15 pr-15 
              pt-5 pb-5 rounded-lg mr-5 ">
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" 
              viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="49" fill="white" stroke="#E5E5E5" 
                strokeWidth="1"/>
              <line x1="30" y1="50" x2="70" y2="50" stroke="#BDBDBD" 
                strokeWidth="3"/>
              <line x1="50" y1="30" x2="50" y2="70" stroke="#BDBDBD" 
                strokeWidth="3"/>
            </svg>
          </button>

          {/* <Variants isDisplayed={isShownVariants} addProject={addProject}
            closeVariants={() => setIsShownVariants(false)}/> */}
        </div>

        {projects.map((project, index) => (
          <div key={index} className="projects-item bg-white rounded-lg   
            mr-5 mb-5 w-55 h-35">
            <ProjectCard title={project.title} />
          </div>
        ))}


      </div>

      <ProjectCreator isVisible={isProjectVisible} 
              closeWindow={() => setIsProjectVisible(false)}
              addProject = {addProject}/>
    </section>
  )
}