import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import MapDto from "../interfaces/MapDto";
import { useRouter } from "next/navigation";


interface ProjectCreatorProps {
  closeWindow: () => void,
  isVisible: boolean,
  addMap: ({mapData}: 
    {mapData: MapDto}) => void;
}

export default function MapCreator({closeWindow, isVisible, addMap}: 
  ProjectCreatorProps) {

  const [mounted, setMounted] =  useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); 

  const mapAreaRouter = useRouter();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  } , []);

  const display = isVisible ? "block" : "hidden";
  const inputStyles = `mt-3 bg-white rounded-xl border border-gray-300
        w-[93%] text-[#676767] font-inter text-lg p-3`

  const createMap = () => { 
    const mapDto: MapDto = {
      title: title,
      description: description,
    };

    addMap({mapData: mapDto});

    setTitle("");
    setDescription("");
    closeWindow();
    mapAreaRouter.push('/map-area');
  }

  if (!mounted || !isVisible) return null;

  return createPortal(
    <div className={`wrapper ${display}`}>

      <div className={`darker top-0 left-0 fixed w-full h-full 
      bg-black opacity-20`} 
        onClick={closeWindow}
        onMouseDown={e => e.stopPropagation()}>
      </div>

      <div className="map-creator z-50 fixed left-[32%] top-[10%] w-150 
        rounded-lg"
        onClick={e=> e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}>
        <div className="project-header bg-white flex justify-between rounded-t-lg p-3">
          <h5 className="font-inter font-bold text-5xl">Create map</h5>
          <button onClick={closeWindow} className="cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
            className="w-10 h-10" fill="none" >

              <line x1="30" y1="30" x2="70" y2="70" stroke="#BDBDBD" 
                strokeWidth="5" strokeLinecap="round"/>
              
              <line x1="70" y1="30" x2="30" y2="70" stroke="#BDBDBD" 
                strokeWidth="5"strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="project-inputs bg-[#efefef]">
          <form action="" className="project-form ml-5">
            <input className={inputStyles} type="text" placeholder="Name"
              onChange={(e) => setTitle(e.target.value)}/>
            <textarea className={inputStyles} placeholder="Description"
              onChange={(e) => setDescription(e.target.value)}/>

            <button className="add-filters-button cursor-pointer w-[93%] p-1  
              underline-offset-2text-white font-inter mt-3 text-2xl rounded transition-all duration-300 text-white font-bold hover:shadow-md bg-[#4b4276] hover:bg-[#564f7a] mb-3 pt-2 pb-2"
              onClick={() => createMap()}
              type="button"
              >Create</button>
          </form>
        </div>
      </div>
    </div>
  , document.body
  );
}