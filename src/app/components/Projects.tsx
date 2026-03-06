"use client";

import { useState } from "react";
import Card from "./Card";
import ProjectCreator from "./ProjectCreator";
import SectionWrapper from "./SectionWrapper";
import AddButton from "./AddButton";
import Image from "next/image";
import Link from "next/link";
import { useMainStore } from "@/store/useMainStore";
import Project from "../interfaces/Project";

export default function Projects() {
  const projects = useMainStore((state) => state.projects);
  const addProject = useMainStore((state) => state.addProject);
  const [isCreatorVisible, setIsCreatorVisible] = useState<boolean>(false);

  // --- ЛОГІКА СОРТУВАННЯ ПРОЄКТІВ ---
  const sortedProjects = [...projects].sort((a: Project, b: Project) => {
    // 1. Проєкт "Загальний" (або "General") ЗАВЖДИ в самому низу
    // Заміни "Загальний" на ту назву, яка в тебе використовується для дефолтного проєкту
    if (a.title === "General") return 1;  // Опускаємо a вниз
    if (b.title === "General") return -1; // Опускаємо b вниз

    // 2. Інші проєкти сортуємо за останніми (наприклад, за датою оновлення чи входу)
    // Якщо у тебе в інтерфейсі Project є поле типу lastVisitedAt чи updatedAt:
    // const timeA = new Date(a.lastVisitedAt || 0).getTime();
    // const timeB = new Date(b.lastVisitedAt || 0).getTime();
    // return timeB - timeA; 

    // *Якщо дати поки немає, залишаємо їх у тому порядку, як вони є, 
    // або сортуємо за ID (від новіших до старіших):
    return b.id - a.id; 
  });

  return (
    <SectionWrapper title="Projects" isLineShown={false}>
      <div className="mt-4 flex flex-wrap items-start justify-center gap-4 sm:justify-start sm:gap-6">
        <AddButton
          onClick={() => setIsCreatorVisible(true)}
          aria-label="Create new project"
        />

        {/* Рендеримо вже ВІДСОРТОВАНИЙ масив */}
        {sortedProjects.map((project: Project) => (
          <Link
            href={`/project-area/${project.id}`}
            key={project.id}
            className="block max-w-full cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
          >
            <Card title={project.title}>
              <div className="relative h-[105px] w-[200px] max-w-full sm:w-[200px]">
                <Image
                  src={
                    project.iconName
                      ? `/icons/${project.iconName}`
                      : "/default-placeholder.svg"
                  }
                  fill
                  alt={project.title}
                  className="rounded object-cover text-xs"
                />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <ProjectCreator
        isVisible={isCreatorVisible}
        closeWindow={() => setIsCreatorVisible(false)}
        addProject={addProject}
      />
    </SectionWrapper>
  );
}