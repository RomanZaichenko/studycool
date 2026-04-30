"use client";

import Map from "../interfaces/Map";
import { useState, useMemo } from "react";
import Card from "./Card";
import MapDto from "../interfaces/MapDto";
import MapCreator from "./MapCreator";
import Link from "next/link";
import SectionWrapper from "./SectionWrapper";
import AddButton from "./AddButton";
import { useRouter } from "next/navigation";
import { useMainStore } from "@/store/useMainStore";
import SortDropdown, { SortOption } from "./SortDropdown";

export default function RecentMaps() {
  const addMapToStore = useMainStore((state) => state.addMap);
  const knowledgeMaps = useMainStore((state) => state.maps);
  const projects = useMainStore((state) => state.projects);

  const [isCreatorVisible, setIsCreatorVisible] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const router = useRouter();

  const sortedMaps = useMemo(() => {
    return [...knowledgeMaps].sort((a, b) => {
      if (a.title === "General" || a.title === "Загальний") return 1;
      if (b.title === "General" || b.title === "Загальний") return -1;

      const timeAOpened = new Date(a.lastOpened).getTime();
      const timeBOpened = new Date(b.lastOpened).getTime();
      const timeACreated = new Date(a.createdAt).getTime();
      const timeBCreated = new Date(b.createdAt).getTime();

      switch (sortBy) {
        case "name-asc":
          return a.title.localeCompare(b.title);
        case "name-desc":
          return b.title.localeCompare(a.title);
        case "newest":
          return timeBCreated - timeACreated;
        case "oldest":
          return timeACreated - timeBCreated;
        case "recent":
        default:
          return timeBOpened - timeAOpened;
      }
    });
  }, [knowledgeMaps, sortBy]);

  const addMap = ({ mapData }: { mapData: MapDto }) => {
    const generalProject = projects.find(
      (p) => p.title === "Загальний" || p.title === "General"
    );

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
    <SectionWrapper
      title="Recent Maps"
      isLineShown={true}
      isCollapsed={isCollapsed}
      onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      headerControls={<SortDropdown value={sortBy} onChange={setSortBy} />}
    >
      <div className="flex w-full flex-wrap items-start gap-4 sm:gap-6">
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