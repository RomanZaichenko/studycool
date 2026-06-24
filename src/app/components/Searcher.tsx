"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import MiniSearch from "minisearch";
import { useMainStore } from "@/store/useMainStore";
import { useMapEditorStore } from "@/store/useMapEditorStore";

export interface GlobalSearchResult {
  id: string;
  originalId: string;
  parentId?: string;
  title: string;
  path: string;
  contentSnippet: string;
  type: "project" | "map" | "node";
}

interface SearchDocument {
  id: string;
  originalId: string;
  parentId?: string;
  title: string;
  content: string;
  path: string;
  type: "project" | "map" | "node";
}

interface MapNodeData {
  id: string;
  data?: {
    label?: string;
    noteContent?: string;
  };
}

interface ExtendedMap {
  id: string;
  title: string;
  projectId: string;
  description?: string;
  nodes?: MapNodeData[];
}

const miniSearch = new MiniSearch<SearchDocument>({
  idField: "id",
  fields: ["title", "content"],
  storeFields: ["title", "content", "type", "path", "originalId", "parentId"],
  searchOptions: {
    prefix: true,
    fuzzy: (term) => (term.length > 3 ? 0.2 : false),
    boost: { title: 2 },
  },
});

const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  if (!highlight.trim()) return <>{text}</>;
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span
            key={i}
            className="rounded-sm bg-yellow-200 px-[2px] font-bold text-gray-900"
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export default function Searcher({ className = "" }: { className?: string }) {
  const router = useRouter();

  const projects = useMainStore((state) => state.projects);
  const maps = useMainStore((state) => state.maps);
  const activeNodes = useMapEditorStore((state) => state.nodes);
  const _rawActiveMapId = useMapEditorStore((state) => state.currentMapId);
  const activeMapId = _rawActiveMapId != null ? String(_rawActiveMapId) : null; 

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [filteredResults, setFilteredResults] = useState<GlobalSearchResult[]>(
    []
  );
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    miniSearch.removeAll();
    const docsMap = new Map<string, SearchDocument>();

    projects.forEach((p) => {
      const docId = `proj-${p.id}`;
      docsMap.set(docId, {
        id: docId,
        originalId: String(p.id),
        title: p.title || "Без назви",
        content: p.description || "",
        path: "Категорія: Проєкти",
        type: "project",
      });
    });

    maps.forEach((m) => {
      const proj = projects.find((p) => p.id === m.projectId);
      const mapDocId = `map-${m.id}`;

      docsMap.set(mapDocId, {
        id: mapDocId,
        originalId: String(m.id),
        title: m.title || "Без назви",
        content: m.description || "",
        path: proj ? `Проєкт: ${proj.title}` : "Мапа",
        type: "map",
      });

      const mapWithNodes = m as unknown as ExtendedMap;

      if (mapWithNodes.nodes && m.id !== activeMapId) {
        mapWithNodes.nodes.forEach((n) => {
          const rawContent = n.data?.noteContent || "";
          const cleanContent = rawContent
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          const noteDocId = `note-${m.id}-${n.id}`;

          docsMap.set(noteDocId, {
            id: noteDocId,
            originalId: String(n.id),
            parentId: m.id,
            title: n.data?.label || "Нотатка",
            content: cleanContent,
            path: `Мапа: ${m.title}`,
            type: "node",
          });
        });
      }
    });

    if (activeMapId && activeNodes.length > 0) {
      const currentMap = maps.find((m) => m.id === activeMapId);
      activeNodes.forEach((n) => {
        const rawContent = (n.data?.noteContent as string) || "";
        const cleanContent = rawContent
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const activeNoteDocId = `note-${activeMapId}-${n.id}`;

        docsMap.set(activeNoteDocId, {
          id: activeNoteDocId,
          originalId: n.id,
          parentId: activeMapId,
          title: (n.data?.label as string) || "Нотатка",
          content: cleanContent,
          path: `Мапа: ${currentMap?.title || "Поточна"}`,
          type: "node",
        });
      });
    }

    miniSearch.addAll(Array.from(docsMap.values()));
  }, [projects, maps, activeNodes, activeMapId]);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const debounceTimer = setTimeout(() => {
      const results = miniSearch.search(query);

      const formattedResults: GlobalSearchResult[] = results.map((res) => {
        const content = String(res.content || "");
        let snippet = "";
        const matchIndex = content.toLowerCase().indexOf(query.toLowerCase());

        if (matchIndex !== -1) {
          const start = Math.max(0, matchIndex - 30);
          const end = Math.min(content.length, matchIndex + query.length + 30);
          snippet =
            (start > 0 ? "..." : "") +
            content.substring(start, end) +
            (end < content.length ? "..." : "");
        } else if (content.length > 0) {
          snippet = content.substring(0, 60) + "...";
        }

        return {
          id: res.id,
          originalId: String(res.originalId),
          parentId: res.parentId ? String(res.parentId) : undefined,
          title: String(res.title || ""),
          path: String(res.path || ""),
          contentSnippet: snippet,
          type: res.type as GlobalSearchResult["type"],
        };
      });

      setFilteredResults(formattedResults.slice(0, 10));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigate = (result: GlobalSearchResult) => {
    setIsOpen(false);
    setQuery("");

    if (result.type === "project") {
      router.push(`/?projectId=${result.originalId}`);
    } else if (result.type === "map") {
      router.push(`/map-area/${result.originalId}`);
    } else {
      router.push(`/map-area/${result.parentId}?openNode=${result.originalId}`);
    }
  };

  return (
    <div
      ref={searchRef}
      className={`relative mr-4 w-40 sm:w-56 md:mr-8 md:w-80 lg:w-[400px] ${className}`}
    >
      <div className="focus-within:border-primary-color flex h-10 w-full items-center rounded-sm border border-transparent bg-white shadow-sm transition-colors">
        <input
          type="text"
          placeholder="Пошук..."
          aria-label="Searcher"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="font-victor h-full w-full bg-transparent pl-3 text-sm text-zinc-700 outline-none placeholder:text-gray-400 md:text-base"
        />
        <button className="border-ui-border-color flex h-8 w-10 shrink-0 cursor-pointer items-center justify-center border-l-2 transition-colors hover:bg-gray-50">
          <Image
            src="/icons/searcher.svg"
            alt="Search"
            width={20}
            height={20}
            style={{ width: "20px", height: "auto" }}
          />
        </button>
      </div>

      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-2 max-h-[360px] w-full overflow-y-auto rounded-md bg-[#f3f4f6] p-2 shadow-lg">
          {isSearching ? (
            <div className="animate-pulse p-4 text-center text-sm text-gray-500">
              Пошук...
            </div>
          ) : filteredResults.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {filteredResults.map((result) => (
                <li
                  key={result.id}
                  onClick={() => handleNavigate(result)}
                  className="flex cursor-pointer flex-col rounded bg-white p-3 shadow-sm transition-colors hover:bg-gray-50"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-800">
                      <HighlightText text={result.title} highlight={query} />
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        result.type === "project"
                          ? "bg-purple-100 text-purple-600"
                          : result.type === "map"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                      }`}
                    >
                      {result.type === "project"
                        ? "Проєкт"
                        : result.type === "map"
                          ? "Мапа"
                          : "Нотатка"}
                    </span>
                  </div>

                  {result.contentSnippet && (
                    <div className="mb-1 text-sm leading-relaxed text-gray-600">
                      <span className="mr-1 text-[10px] font-bold text-gray-400 uppercase">
                        Текст:
                      </span>
                      <HighlightText
                        text={result.contentSnippet}
                        highlight={query}
                      />
                    </div>
                  )}

                  {result.path && (
                    <span className="mt-auto font-mono text-[10px] text-gray-400">
                      {result.path}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              Нічого не знайдено
            </div>
          )}
        </div>
      )}
    </div>
  );
}
