"use client";

import Map from "../interfaces/Map";
import { useState } from "react";
import Card from "./Card";
import MapDto from "../interfaces/MapDto";
import MapCreator from "./MapCreator";
import Link from "next/link";
import SectionWrapper from "./SectionWrapper";
import AddButton from "./AddButton";
import { useRouter } from 'next/navigation';
import { useMainStore } from "@/store/useMainStore";

export default function RecentMaps() {
  const addMapToStore = useMainStore((state) => state.addMap);
  const knowledgeMaps = useMainStore((state) => state.maps);
  const projects = useMainStore((state) => state.projects);
  
  const [isCreatorVisible, setIsCreatorVisible] = useState<boolean>(false);
  const router = useRouter();
  const sortedMaps = [...knowledgeMaps].sort((a, b) => {
    return new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime();
  });

  const addMap = ({ mapData }: { mapData: MapDto }) => {
  const generalProject = projects.find(p => p.title === "Загальний");

  const newMap: Map = {
    id: Date.now(),
    title: mapData.title,
    description: mapData.description,
    projectId: mapData.projectId || generalProject?.id || 0, 
    createdAt: new Date(),
    lastOpened: new Date(),
    miniMapIcon: undefined,
  };

  addMapToStore(newMap);
  setIsCreatorVisible(false);
  router.push(`/map-area/${newMap.id}`);
};

  return (
    <SectionWrapper title="Recent Maps" isLineShown={true}>
      <div className="mt-4 flex flex-wrap items-start justify-center gap-4 sm:justify-start sm:gap-6">
        <AddButton 
          onClick={() => setIsCreatorVisible(true)}
          aria-label="Create new map" 
        />

        {sortedMaps.map((map: Map) => (
          <Link
            href={`/map-area/${map.id}`}
            key={map.id}
            className="block max-w-full cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Card title={map.title}>
              <svg className="h-24 w-full max-w-[14rem] rounded bg-gray-50 sm:w-56"></svg>
            </Card>
          </Link>
        ))}
      </div>

      <MapCreator
        isVisible={isCreatorVisible}
        closeWindow={() => setIsCreatorVisible(false)}
        addMap={addMap}
      />
    </SectionWrapper>
  );
}