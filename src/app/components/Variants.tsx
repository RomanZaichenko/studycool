import { useState } from "react";
import ProjectCreator from "./ProjectCreator";
import ProjectDto from "../interfaces/ProjectDto";

interface VariantsProps {
  isDisplayed: boolean;
  addProject: ({projectData}: {projectData: ProjectDto}) => void;
  closeVariants?: () => void;
}


export default function Variants({isDisplayed, addProject, closeVariants}: 
  VariantsProps) { 

  const display = isDisplayed ? "block" : "hidden";
  const [isProjectVisible, setProjectVisible] = useState<boolean>(false)

  return (
    <div className={`variants-to-choose ${display} absolute top-5 left-[25%]  
      w-50 bg-white border-2 border-gray-200 rounded-lg`} onMouseDown={e => e.preventDefault()}>

      <div className="variants-title flex justify-between">
        <h4 className="variants-title font-victor text-2xl p-2 pr-0">
          Create
        </h4>

        <button className="close-variants cursor-pointer" 
          onClick={closeVariants}>

          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
            className="w-10 h-10" fill="none" >

            <line x1="30" y1="30" x2="70" y2="70" stroke="#BDBDBD" 
              strokeWidth="3" strokeLinecap="round"/>
            
            <line x1="70" y1="30" x2="30" y2="70" stroke="#BDBDBD" 
              strokeWidth="3"strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="map-choice cursor-pointer bg-[#FBF6F6] text-3xl     
        font-victor text-[#B5B2B2] p-2 pr-0">
        <p>Map</p>
      </div>

      <hr className="text-[#333] opacity-20"/>

      <div className="area-choice cursor-pointer bg-[#FBF6F6] text-3xl
        font-victor text-[#B5B2B2]  p-2 pr-0"
        onClick={() => setProjectVisible(true)}>
        <p>Project</p>
      </div>

      <ProjectCreator isVisible={isProjectVisible} 
        closeWindow={() => setProjectVisible(false)}
        addProject = {addProject}/>
    </div>
  )
}