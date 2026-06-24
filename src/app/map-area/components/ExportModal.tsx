"use client";

import { useMapEditorStore } from "@/store/useMapEditorStore";
import { useMainStore } from "@/store/useMainStore";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { type Node as FlowNode, Edge } from "@xyflow/react";

import { processExport } from "@/lib/exportService";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: "map" | "note";
  fileName?: string;
  activeNodeId?: string;
  nodes?: FlowNode[];
  edges?: Edge[];
}

const MAP_CATEGORIES = [
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

const NOTE_CATEGORIES = [
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

export function ExportModal({
  isOpen,
  onClose,
  exportType,
  fileName: propFileName,
  activeNodeId,
  nodes: propNodes,
  edges: propEdges,
}: ExportModalProps) {
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

  if (!isOpen || !isMounted) return null;

  const handleCategoryClick = (catId: string, exts: string[]) => {
    setSelectedCategory(catId);
    setSelectedExt(exts[0]);
  };

  const handleExport = () => {
    const currentMap = currentMapId != null 
      ? maps.find((m) => m.id === String(currentMapId)) 
      : undefined;

    const finalFileName = propFileName || currentMap?.title || "My_Map";
    const finalNodes = propNodes || globalNodes;
    const finalEdges = propEdges || globalEdges;

    try {
      processExport(
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

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/10 p-4 font-sans backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-sm border border-gray-200 bg-[#F0F0F0] p-10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-10 text-gray-300 hover:text-gray-500"
        >
          <svg
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="mb-8 text-4xl font-bold text-gray-800">{modalTitle}</h2>

        <div className="mb-8 grid grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id, cat.extensions)}
              className={`flex cursor-pointer flex-col justify-center rounded-sm border bg-white p-5 shadow-sm transition-all ${
                selectedCategory === cat.id
                  ? "border-gray-800 ring-1 ring-gray-800"
                  : "border-gray-100 hover:border-gray-300"
              }`}
            >
              <span className="text-lg font-bold text-gray-700">
                {cat.label}
              </span>
              <span className="mt-1 text-xs font-medium text-gray-400">
                {cat.desc}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-10 flex h-12 items-center gap-4">
          {activeCategoryData && activeCategoryData.extensions.length > 1 ? (
            <>
              <span className="text-sm font-bold text-gray-500">
                File format:
              </span>
              <div className="flex gap-2">
                {activeCategoryData.extensions.map((ext) => (
                  <button
                    key={ext}
                    onClick={() => setSelectedExt(ext)}
                    className={`rounded-sm px-4 py-2 text-sm font-bold uppercase transition-colors ${
                      selectedExt === ext
                        ? "bg-gray-800 text-white"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    .{ext}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500">
                File format:
              </span>
              <span className="rounded-sm bg-gray-200 px-4 py-2 text-sm font-bold text-gray-700 uppercase">
                .{selectedExt}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
          <button
            onClick={onClose}
            className="rounded-sm px-6 py-4 text-sm font-bold text-gray-500 hover:text-gray-800"
          >
            CANCEL
          </button>
          <button
            onClick={handleExport}
            className="rounded-sm border border-gray-200 bg-white px-8 py-4 text-sm font-bold text-gray-800 uppercase hover:bg-gray-50"
          >
            Export as .{selectedExt}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
