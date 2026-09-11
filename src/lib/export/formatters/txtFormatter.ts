import { GraphData } from "../graph";

export const formatAsTxt = (
  fileName: string,
  data: GraphData,
  isSingleNote: boolean
): Blob => {
  let text = `${fileName.toUpperCase()}\n==============================\n\n`;
  if (isSingleNote && data.hierarchical.length > 0)
    text += data.hierarchical[0].content;
  else {
    data.hierarchical.forEach((node) => {
      const indent = "  ".repeat(node.depth - 1);
      text += `${indent}${node.depth === 1 ? "■ " : "• "}${node.title}\n`;
      if (node.content.trim()) text += `${indent}    ${node.content}\n`;
      text += "\n";
    });
    if (data.orphans.length > 0) {
      text += `\nСамотні нотатки:\n==============================\n\n`;
      data.orphans.forEach((node) => {
        text += `■ ${node.title}\n`;
        if (node.content.trim()) text += `    ${node.content}\n`;
        text += "\n";
      });
    }
  }
  return new Blob([text], { type: "text/plain; charset=utf-8" });
};