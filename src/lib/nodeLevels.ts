import { type Node, type Edge } from "@xyflow/react";

export const propagateLevelChange = (
  rootNodeId: string,
  newLevel: number,
  nodes: Node[],
  edges: Edge[]
): Node[] => {
  const safeLevel = Math.min(newLevel, 3);

  let updatedNodes = nodes.map((node) => {
    if (node.id === rootNodeId) {
      if (node.data?.level === safeLevel) return node;
      return { ...node, data: { ...node.data, level: safeLevel } };
    }
    return node;
  });

  if (safeLevel >= 3) return updatedNodes;

  edges
    .filter((e) => e.source === rootNodeId)
    .forEach((e) => {
      updatedNodes = propagateLevelChange(
        e.target,
        safeLevel + 1,
        updatedNodes,
        edges
      );
    });

  return updatedNodes;
};