"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { type Node as FlowNode, type Edge } from "@xyflow/react";
import { processImport } from "@/app/lib/importService";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { nodes: FlowNode[]; edges: Edge[] }) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const importedData = await processImport(file);
      onImport(importedData);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Помилка імпорту.");
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-[#111111]/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-md bg-[#f0f0f0] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-2xl font-bold text-[#333333]">Import Map</h2>

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
          onClick={onClose}
          className="mt-4 w-full text-center text-xs font-bold text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}
