import {convertHtmlToText} from "../utils";
import { type Node as FlowNode, Edge } from "@xyflow/react";

export interface ParsedNode {
  title: string;
  content: string;
  rawContent: string;
  depth: number;
}

export interface GraphData {
  hierarchical: ParsedNode[];
  orphans: ParsedNode[];
}

export const parseGraph = (nodes: FlowNode[], edges: Edge[]): GraphData => {
  const hierarchical: ParsedNode[] = [];
  const orphans: ParsedNode[] = [];
  const visited = new Set<string>();
  const targetIds = new Set(edges.map((e) => e.target));

  const dfs = (nodeId: string, depth: number) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    hierarchical.push({
      title: (node.data?.label as string) || "Нотатка",
      content: convertHtmlToText((node.data?.noteContent as string) || ""),
      rawContent: (node.data?.noteContent as string) || "",
      depth,
    });
    edges
      .filter((e) => e.source === nodeId)
      .forEach((edge) => dfs(edge.target, depth + 1));
  };

  nodes.filter((n) => !targetIds.has(n.id)).forEach((root) => dfs(root.id, 1));
  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      orphans.push({
        title: (node.data?.label as string) || "Нотатка",
        content: convertHtmlToText((node.data?.noteContent as string) || ""),
        rawContent: (node.data?.noteContent as string) || "",
        depth: 1,
      });
    }
  });

  return { hierarchical, orphans };
};