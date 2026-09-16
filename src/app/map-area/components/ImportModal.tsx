"use client";

import { createPortal } from "react-dom";
import { type Node as FlowNode, type Edge } from "@xyflow/react";
import { useImportModal } from "../hooks/useImportModal";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { nodes: FlowNode[]; edges: Edge[] }) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const {
    isLoading,
    pendingData,
    resetState,
    handleFileUpload,
    handleImportAsNew,
  } = useImportModal({ onClose, onImport });

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#111111]/80 p-4 backdrop-blur-sm"
      onClick={resetState}
    >
      <div
        className="relative w-full max-w-md rounded-md bg-[#f0f0f0] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!pendingData ? (
          <>
            <h2 className="mb-6 text-2xl font-bold text-[#333333]">
              Import Map
            </h2>

            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded bg-white px-6 py-4 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 ${isLoading ? "opacity-50" : ""}`}
            >
              {isLoading ? "Loading..." : "Select .studycool File"}
              <input
                type="file"
                accept=".studycool,.json"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </label>

            <button
              onClick={resetState}
              className="mt-4 w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h2 className="mb-4 text-2xl font-bold text-[#333333]">
              Attention: Data Conflict
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              It seems these nodes already exist on your canvas. What would you
              like to do?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={resetState}
                className="w-full rounded border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                Go to Existing (Cancel)
              </button>
              <button
                onClick={handleImportAsNew}
                className="w-full rounded bg-gray-800 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-gray-700"
              >
                Create Copy (Generate New IDs)
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
