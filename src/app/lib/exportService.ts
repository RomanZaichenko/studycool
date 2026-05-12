import { Node, Edge } from "@xyflow/react";
import { convertHtmlToText } from "./utils";

export interface ParsedNode {
  title: string;
  content: string;
  depth: number;
}

export interface GraphData {
  hierarchical: ParsedNode[];
  orphans: ParsedNode[];
}

const downloadBlob = (blob: Blob, fullFileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fullFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const parseGraph = (nodes: Node[], edges: Edge[]): GraphData => {
  const hierarchical: ParsedNode[] = [];
  const orphans: ParsedNode[] = [];

  const targetIds = new Set(edges.map((e) => e.target));
  const roots = nodes.filter((n) => !targetIds.has(n.id));
  const visited = new Set<string>();

  const dfs = (nodeId: string, depth: number) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    hierarchical.push({
      title: (node.data?.label as string) || "Нотатка без назви",
      content: convertHtmlToText((node.data?.noteContent as string) || ""),
      depth,
    });

    const children = edges.filter((e) => e.source === nodeId);
    children.forEach((e) => dfs(e.target, depth + 1));
  };

  roots.forEach((root) => dfs(root.id, 1));

  nodes.forEach((n) => {
    if (!visited.has(n.id)) {
      orphans.push({
        title: (n.data?.label as string) || "Нотатка без назви",
        content: convertHtmlToText((n.data?.noteContent as string) || ""),
        depth: 1,
      });
    }
  });

  return { hierarchical, orphans };
};

const formatAsStudyCool = (
  fileName: string,
  nodes: Node[],
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

const formatAsTxt = (fileName: string, data: GraphData): Blob => {
  let text = `${fileName.toUpperCase()}\n==============================\n\n`;

  data.hierarchical.forEach((node) => {
    const indent = "  ".repeat(node.depth - 1);
    const prefix = node.depth === 1 ? "■ " : node.depth === 2 ? "○ " : "• ";

    text += `${indent}${prefix}${node.title}\n`;

    if (node.content.trim()) {
      text += `${indent}    
      ${node.content}\n`;
    }
    text += "\n";
  });

  if (data.orphans.length > 0) {
    text += `\nOrphan notes:\n==============================\n\n`;
    data.orphans.forEach((node) => {
      text += `■ ${node.title}\n`;
      if (node.content.trim()) {
        text += `    ${node.content}\n`;
      }
      text += "\n";
    });
  }

  return new Blob([text], { type: "text/plain; charset=utf-8" });
};

export const processExport = (
  format: string,
  fileName: string,
  nodes: Node[],
  edges: Edge[]
) => {
  let blob: Blob;
  const safeFileName = fileName.replace(/[^a-z0-9]/gi, "_");

  switch (format) {
    case "studycool":
      blob = formatAsStudyCool(safeFileName, nodes, edges);
      break;
    case "txt":
      const parsedData = parseGraph(nodes, edges);
      blob = formatAsTxt(safeFileName, parsedData);
      break;
    default:
      throw new Error("Unsupported export format");
  }

  downloadBlob(blob, `${safeFileName}.${format}`);
};
