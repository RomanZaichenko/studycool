import { type Node as FlowNode, Edge } from "@xyflow/react";

export interface ImportedData {
  nodes: FlowNode[];
  edges: Edge[];
}

export const processImport = async (file: File): Promise<ImportedData> => {
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  if (ext !== "studycool" && ext !== "json") {
    throw new Error("Only .studycool and .json formats are supported.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.nodes || !Array.isArray(data.nodes)) {
          throw new Error("File format is invalid: 'nodes' array is missing.");
        }
        resolve({ nodes: data.nodes, edges: data.edges || [] });
      } catch {
        reject(new Error("Error occurred while reading the file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read the file."));
    reader.readAsText(file);
  });
};