"use client";

import Map from "../interfaces/Map";
import { useState } from "react";
import MapCard from "./MapCard";
import MapDto from "../interfaces/MapDto";
import MapCreator from "./MapCreator";


export default function RecentMaps() {

  const [knowledgeMaps, setKnowledgeMaps] = useState<Map[]>([]);
  const [isMapVisible, setIsMapVisible] = useState<boolean>(false)
  

  const addMap = ({mapData} : {mapData: MapDto}) => {
    const newMap: Map = {
      id: Date.now(),
      title: mapData.title,
      description: mapData.description,
      createdAt: new Date(),
      lastOpened: new Date(),
      miniMapIcon: undefined
    };

    const updatedMaps = [newMap, ...knowledgeMaps];
    setKnowledgeMaps(updatedMaps);
    setIsMapVisible(false);
  }
  return (
    <section className="recent-maps ml-9 w-full">
      <h2 className="">Recent Maps</h2>

      <div className="maps flex flex-wrap mb-5">
        <div className="create-map-button relative  ">
          <button onClick={() => setIsMapVisible(true)}
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
        </div>

        {knowledgeMaps.map((map, index) => (
          <div key={index} className="map bg-white rounded-lg w-55 h-35 mr-5 mb-5">
            <MapCard title={map.title} />
          </div>
        ))}
      </div>
      
      <hr className="w-[70vw] text-[#333] border-1 opacity-20"/>

      <MapCreator isVisible={isMapVisible} 
        closeWindow={() => setIsMapVisible(false)}
        addMap= {addMap}/>
    </section>
  )
} 