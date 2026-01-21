"use client";

import Map from "../interfaces/Map";
import { useState } from "react";
import MapCard from "./MapCard";


export default function RecentMaps() {

  const [knowledgeMaps, setKnowledgeMaps] = useState<Map[]>([{
        id: 1,
        title: 'Sample Map 1'
      },
      {
        id: 2,
        title: 'Sample Map 2'
      }]);

  
  return (
    <section className="recent-maps ml-9 w-full">
      <h2 className="">Recent Maps</h2>

      <div className="maps flex flex-wrap ">
        {knowledgeMaps.map((map, index) => (
          <div key={index} className="map bg-white rounded-lg p-5 mr-5 mb-5">
            <MapCard title={map.title} />
          </div>
        ))}
      </div>

      <hr className="w-[70vw] text-[#333] border-1 opacity-20"/>
    </section>
  )
} 