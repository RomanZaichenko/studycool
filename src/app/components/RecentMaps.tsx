  "use client";

  import Map from "../interfaces/Map";
  import { useEffect, useState } from "react";
  import Card from "./Card";
  import MapDto from "../interfaces/MapDto";
  import MapCreator from "./MapCreator";
  import Link from "next/link";
  import SectionWrapper from "./SectionWrapper";
  import AddButton from "./AddButton";


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
      <SectionWrapper title="Recent Maps" isLineShown={true}>
        <AddButton className="mr-5" onClick={() => setIsMapVisible(true)} />

        {knowledgeMaps.map((map) => (
          <Link href={`/map-area/${map.id}`} key={map.id}>
            <div className=" mr-5 mb-5 cursor-pointer">
                
              <Card title={map.title}>
                <svg className="w-55 h-26"> 
                </svg>
              </Card>
            </div>
          </Link>
        ))}

        <MapCreator isVisible={isMapVisible} 
          closeWindow={() => setIsMapVisible(false)}
          addMap= {addMap}/>
      </SectionWrapper>
    )
  } 