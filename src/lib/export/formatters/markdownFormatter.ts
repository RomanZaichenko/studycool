import TurndownService from "turndown";
import { GraphData } from "../graph";

export const formatAsMarkdown = (
  fileName: string,
  data: GraphData,
  isSingleNote: boolean
): Blob => {
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });
  let md = `# ${fileName}\n\n`;
  if (isSingleNote && data.hierarchical.length > 0)
    md += `${turndown.turndown(data.hierarchical[0].rawContent)}\n\n`;
  else {
    data.hierarchical.forEach((node) => {
      const prefix =
        node.depth === 1 ? "# " : node.depth === 2 ? "## " : "### ";
      md += `${prefix}${node.title}\n\n${turndown.turndown(node.rawContent)}\n\n`;
    });
    if (data.orphans.length > 0) {
      md += `---\n\n## Самотні нотатки\n\n`;
      data.orphans.forEach((node) => {
        md += `### ${node.title}\n\n${turndown.turndown(node.rawContent)}\n\n`;
      });
    }
  }
  return new Blob([md], { type: "text/markdown; charset=utf-8" });
};
