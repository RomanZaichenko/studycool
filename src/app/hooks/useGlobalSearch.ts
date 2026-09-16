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

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function useGlobalSearch() {
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
          const cleanContent = stripHtml(n.data?.noteContent || "");
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
        const cleanContent = stripHtml((n.data?.noteContent as string) || "");
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

  return {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    searchRef,
    filteredResults,
    isSearching,
    handleNavigate,
  };
}
