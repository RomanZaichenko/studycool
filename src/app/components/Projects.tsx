"use client"

import {useRef, useState, useEffect} from "react";
import Project from "../interfaces/Project";
import ProjectCard from "./ProjectCard";
import Variants from "./Variants";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isShownVariants, setIsShownVariants] = useState<boolean>(false)

  const showAdditionVariants = () => {
    setIsShownVariants(true);
  }

  const hideAdditionVariants = () => {
    setIsShownVariants(false);
  }
  
  const addProject = ({id, title}: {id: number, title: string}) => {
    const newProjects = [...projects, {id, title}]
    setProjects(newProjects);
  }

  return (
    <section className="areas ml-9 mt-5 text-6xl">
      <h2>Projects</h2>
      
      <div className="areas-items">
        {projects.map((project, index) => (
          <div key={index} className="area-item bg-white rounded-lg p-5 mr-5 mb-5">
            <ProjectCard title={project.title} />
          </div>
        ))}

        <div className="variants" onBlur={hideAdditionVariants}>
          <button onClick={showAdditionVariants}
            className="add-button cursor-pointer">+</button>

          <Variants isDisplayed={isShownVariants} addArea={addProject}/>
        </div>
      </div>
    </section>
  )
}