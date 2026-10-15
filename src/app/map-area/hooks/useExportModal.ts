import { useState, useEffect } from "react";
import { type Node as FlowNode, Edge } from "@xyflow/react";
import { useMapEditorStore } from "@/store/useMapEditorStore";
import { useMainStore } from "@/store/useMainStore";
import { processExport } from "@/lib/export";

export type ExportCategory = {
  id: string;
  label: string;
  desc: string;
  extensions: string[];
};

export const MAP_CATEGORIES: ExportCategory[] = [
  {
    id: "image",
    label: "Image",
    desc: "Visual snapshot of your map",
    extensions: ["png", "jpeg", "svg"],
  },
  {
    id: "document",
    label: "Document",
    desc: "Structured hierarchical file",
    extensions: ["docx", "pdf"],
  },
  {
    id: "text",
    label: "Text",
    desc: "Raw notes and hierarchy",
    extensions: ["md", "txt"],
  },
  {
    id: "studycool",
    label: "StudyCool File",
    desc: "Editable backup format",
    extensions: ["studycool"],
  },
];

export const NOTE_CATEGORIES: ExportCategory[] = [
  {
    id: "document",
    label: "Document",
    desc: "Formatted document",
    extensions: ["docx", "pdf"],
  },
  {
    id: "text",
    label: "Text",
    desc: "Raw text format",
    extensions: ["md", "txt"],
  },
];

interface UseExportModalArgs {
  isOpen: boolean;
  exportType: "map" | "note";
  onClose: () => void;
  fileName?: string;
  activeNodeId?: string;
  nodes?: FlowNode[];
  edges?: Edge[];
}

export function useExportModal({
  isOpen,
  exportType,
  onClose,
  fileName: propFileName,
  activeNodeId,
  nodes: propNodes,
  edges: propEdges,
}: UseExportModalArgs) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExt, setSelectedExt] = useState("");

  const globalNodes = useMapEditorStore((state) => state.nodes);
  const globalEdges = useMapEditorStore((state) => state.edges);
  const currentMapId = useMapEditorStore((state) => state.currentMapId);
  const maps = useMainStore((state) => state.maps);

  const categories = exportType === "map" ? MAP_CATEGORIES : NOTE_CATEGORIES;
  const modalTitle = exportType === "map" ? "Export Mind Map" : "Export Note";

  useEffect(() => {
    if (isOpen) {
      const initialCategory = categories[0];
      setSelectedCategory(initialCategory.id);
      setSelectedExt(initialCategory.extensions[0]);
    }
  }, [exportType, isOpen, categories]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCategoryClick = (catId: string, exts: string[]) => {
    setSelectedCategory(catId);
    setSelectedExt(exts[0]);
  };

  const handleExport = async () => {
    const currentMap =
      currentMapId != null
        ? maps.find((m) => m.id === String(currentMapId))
        : undefined;

    const finalFileName = propFileName || currentMap?.title || "My_Map";
    const finalNodes = propNodes || globalNodes;
    const finalEdges = propEdges || globalEdges;

    try {
      await processExport(
        selectedExt,
        finalFileName,
        finalNodes,
        finalEdges,
        activeNodeId
      );
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Формат ще не підтримується або сталася помилка.");
    }
  };

  const activeCategoryData = categories.find((c) => c.id === selectedCategory);

  return {
    isMounted,
    categories,
    modalTitle,
    selectedCategory,
    selectedExt,
    setSelectedExt,
    activeCategoryData,
    handleCategoryClick,
    handleExport,
  };
}