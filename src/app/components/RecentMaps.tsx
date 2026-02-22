"use client";

import Map from "../interfaces/Map";
import { useState } from "react";
import Card from "./Card";
import MapDto from "../interfaces/MapDto";
import MapCreator from "./MapCreator";
import Link from "next/link";
import SectionWrapper from "./SectionWrapper";
import AddButton from "./AddButton";

export default function RecentMaps() {
  const [knowledgeMaps, setKnowledgeMaps] = useState<Map[]>([]);
  const [isCreatorVisible, setIsCreatorVisible] = useState<boolean>(false);

  const addMap = ({ mapData }: { mapData: MapDto }) => {
    const newMap: Map = {
      id: Date.now(),
      title: mapData.title,
      description: mapData.description,
      createdAt: new Date(),
      lastOpened: new Date(),
      miniMapIcon: undefined,
    };

    setKnowledgeMaps((prevMaps) => [newMap, ...prevMaps]);
    setIsCreatorVisible(false);
  };

  return (
    <SectionWrapper title="Recent Maps" isLineShown={true}>
      <div className="mt-4 flex flex-wrap items-start justify-center gap-4 sm:justify-start sm:gap-6">
        <AddButton onClick={() => setIsCreatorVisible(true)} />

        {knowledgeMaps.map((map) => (
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
