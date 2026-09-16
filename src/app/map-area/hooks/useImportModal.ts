import { useState } from "react";
import { type Node as FlowNode, type Edge } from "@xyflow/react";
import { processImport } from "@/lib/importService";
import { useMapEditorStore } from "@/store/useMapEditorStore";

type PendingData = { nodes: FlowNode[]; edges: Edge[] };

interface UseImportModalArgs {
  onClose: () => void;
  onImport: (data: PendingData) => void;
}

export function useImportModal({ onClose, onImport }: UseImportModalArgs) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingData, setPendingData] = useState<PendingData | null>(null);

  const currentNodes = useMapEditorStore((state) => state.nodes);

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

  return {
    isLoading,
    pendingData,
    resetState,
    handleFileUpload,
    handleImportAsNew,
  };
}
