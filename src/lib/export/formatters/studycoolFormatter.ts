import { type Node as FlowNode, Edge } from "@xyflow/react";

export const formatAsStudyCool = (
  fileName: string,
  nodes: FlowNode[],
  edges: Edge[]
): Blob => {
  const metaData = {
    version: "1.0",
    mapTitle: fileName,
    nodes,
    edges,
    date: new Date().toISOString(),
  };
  return new Blob([JSON.stringify(metaData)], { type: "application/json" });
};