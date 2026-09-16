"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { type Node as FlowNode, Edge } from "@xyflow/react";
import { useExportModal } from "../hooks/useExportModal";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: "map" | "note";
  fileName?: string;
  activeNodeId?: string;
  nodes?: FlowNode[];
  edges?: Edge[];
}

export function ExportModal(props: ExportModalProps) {
  const { isOpen, onClose } = props;

  const {
    isMounted,
    categories,
    modalTitle,
    selectedCategory,
    selectedExt,
    setSelectedExt,
    activeCategoryData,
    handleCategoryClick,
    handleExport,
  } = useExportModal(props);

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/10 p-4 font-sans backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-sm border border-gray-200 bg-[#F0F0F0] p-10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 z-10 text-gray-300 hover:text-gray-500"
        >
          <X strokeWidth={1.5} className="h-10 w-10" />
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
