"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { type Node as FlowNode, type Edge } from "@xyflow/react";
import { processImport } from "@/lib/importService";
import { useMapEditorStore } from "@/store/useMapEditorStore";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: { nodes: FlowNode[]; edges: Edge[] }) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingData, setPendingData] = useState<{
    nodes: FlowNode[];
    edges: Edge[];
  } | null>(null);

  const currentNodes = useMapEditorStore((state) => state.nodes);

  if (!isOpen) return null;

  const resetState = () => {
    setPendingData(null);
    setIsLoading(false);
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const importedData = await processImport(file);

      const hasConflict = importedData.nodes.some((importedNode) =>
        currentNodes.some((currentNode) => currentNode.id === importedNode.id)
      );

      if (hasConflict) {
        setPendingData(importedData);
        setIsLoading(false);
        e.target.value = "";
        return;
      }

      onImport(importedData);
      resetState();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Помилка імпорту.");
      setIsLoading(false);
    }
    e.target.value = "";
  };

  const handleImportAsNew = () => {
    if (!pendingData) return;

    const idMap: Record<string, string> = {};

    const newNodes = pendingData.nodes.map((node) => {
      const newId = `node-${crypto.randomUUID().slice(0, 8)}`;
      idMap[node.id] = newId;
      return { ...node, id: newId };
    });

    const newEdges = pendingData.edges.map((edge) => ({
      ...edge,
      id: `e-${idMap[edge.source] || edge.source}-${idMap[edge.target] || edge.target}`,
      source: idMap[edge.source] || edge.source,
      target: idMap[edge.target] || edge.target,
    }));

    onImport({ nodes: newNodes, edges: newEdges });
    resetState();
  };

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
