import { type Node as FlowNode, Edge } from "@xyflow/react";
import { convertHtmlToText } from "./utils";
import TurndownService from "turndown";
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  ImageRun,
  UnderlineType,
  type IRunOptions 
} from "docx";

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

const rgbToHex = (rgb: string): string | undefined => {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) {
    if (rgb.startsWith('#')) return rgb.replace('#', '');
    return undefined;
  }
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  return (r + g + b).toUpperCase();
};

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

const fetchImageDataAndSize = async (src: string): Promise<{ buffer: ArrayBuffer; width: number; height: number } | null> => {
  try {
    const res = await fetch(src);
    const buffer = await res.arrayBuffer();

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        const maxWidth = 550;
        if (w > maxWidth) {
          h = Math.round((maxWidth / w) * h);
          w = maxWidth;
        }
        resolve({ buffer, width: w, height: h });
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  } catch {
    return null;
  }
};

const processHtmlNode = async (
  node: Node,
  format: IRunOptions = {}
): Promise<(TextRun | ImageRun)[]> => {
  const runs: (TextRun | ImageRun)[] = [];

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    if (text && text.trim() !== "") {
      runs.push(new TextRun({ ...format, text }));
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === "img") {
      const src = (el as HTMLImageElement).src;
      const imgData = await fetchImageDataAndSize(src);
      if (imgData) {
        runs.push(
          new ImageRun({
            data: imgData.buffer,
            transformation: { width: imgData.width, height: imgData.height },
            type: "png"
          })
        );
      }
    } else {
      let nextFormat: IRunOptions = { ...format };
      
      if (tag === "b" || tag === "strong") nextFormat = { ...nextFormat, bold: true };
      if (tag === "i" || tag === "em") nextFormat = { ...nextFormat, italics: true };
      if (tag === "u") nextFormat = { ...nextFormat, underline: { type: UnderlineType.SINGLE } };

      const textColor = el.style.color;
      if (textColor) {
        const hex = rgbToHex(textColor);
        if (hex) nextFormat = { ...nextFormat, color: hex };
      }

      const fontFamily = el.style.fontFamily;
      if (fontFamily) {
        nextFormat = { ...nextFormat, font: fontFamily.replace(/['"]/g, '') };
      }

      const fontSize = el.style.fontSize;
      if (fontSize && fontSize.includes('px')) {
        const size = parseInt(fontSize);
        if (!isNaN(size)) nextFormat = { ...nextFormat, size: size * 1.5 };
      }

      for (const child of Array.from(el.childNodes)) {
        const childRuns = await processHtmlNode(child, nextFormat);
        runs.push(...childRuns);
      }
    }
  }
  return runs;
};

const convertHtmlToDocxParagraphs = async (html: string): Promise<Paragraph[]> => {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const paragraphs: Paragraph[] = [];

  for (const element of Array.from(doc.body.children)) {
    const runs = await processHtmlNode(element);
    if (runs.length > 0) {
      paragraphs.push(new Paragraph({ children: runs, spacing: { after: 200 } }));
    }
  }
  return paragraphs;
};

const parseGraph = (nodes: FlowNode[], edges: Edge[]): GraphData => {
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
      rawContent: (node.data?.noteContent as string) || "",
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
        rawContent: (n.data?.noteContent as string) || "",
        depth: 1,
      });
    }
  });

  return { hierarchical, orphans };
};

const formatAsStudyCool = (fileName: string, nodes: FlowNode[], edges: Edge[]): Blob => {
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
      text += `${indent}    ${node.content}\n`;
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

const formatAsMarkdown = (fileName: string, data: GraphData): Blob => {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  });

  turndownService.addRule('images', {
    filter: 'img',
    replacement: function (content, node) {
      const img = node as HTMLImageElement;
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || 'Зображення';

      if (src.startsWith('blob:') || src.startsWith('data:image')) {
        return `\n*[Зображення: ${alt} (не експортовано)]*\n`;
      }

      return `\n![${alt}](${src})\n`;
    }
  });
  
  let md = `# ${fileName}\n\n`;

  data.hierarchical.forEach((node) => {
    let prefix = "";
    let suffix = "";

    if (node.depth === 1) prefix = "# ";
    else if (node.depth === 2) prefix = "## ";
    else if (node.depth === 3) prefix = "### ";
    else {
      prefix = "- **";
      suffix = "**";
    }

    md += `${prefix}${node.title}${suffix}\n\n`;

    if (node.rawContent.trim()) {
      const markdownContent = turndownService.turndown(node.rawContent);
      md += `${markdownContent}\n\n`;
    }
  });

  if (data.orphans.length > 0) {
    md += `---\n\n## Самотні нотатки\n\n`;
    data.orphans.forEach((node) => {
      md += `### ${node.title}\n\n`;
      if (node.rawContent.trim()) {
        md += `${turndownService.turndown(node.rawContent)}\n\n`;
      }
    });
  }

  return new Blob([md], { type: "text/markdown; charset=utf-8" });
};

const formatAsDocx = async (fileName: string, data: GraphData): Promise<Blob> => {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: fileName.toUpperCase(),
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    })
  );

  const getHeading = (depth: number) => {
    if (depth === 1) return HeadingLevel.HEADING_1;
    if (depth === 2) return HeadingLevel.HEADING_2;
    if (depth === 3) return HeadingLevel.HEADING_3;
    if (depth === 4) return HeadingLevel.HEADING_4;
    return HeadingLevel.HEADING_5;
  };

  for (const node of data.hierarchical) {
    const currentHeading = getHeading(node.depth);

    children.push(
      new Paragraph({
        text: node.title,
        heading: currentHeading,
        spacing: { before: 200, after: 100 },
      })
    );

    if (node.rawContent.trim()) {
      const parsedParagraphs = await convertHtmlToDocxParagraphs(node.rawContent);
      children.push(...parsedParagraphs);
    }
  }

  if (data.orphans.length > 0) {
    children.push(
      new Paragraph({
        text: "Самотні нотатки",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    for (const node of data.orphans) {
      children.push(
        new Paragraph({
          text: node.title,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );

      if (node.rawContent.trim()) {
        const parsedParagraphs = await convertHtmlToDocxParagraphs(node.rawContent);
        children.push(...parsedParagraphs);
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  return await Packer.toBlob(doc);
};

export const processExport = async (
  format: string,
  fileName: string,
  nodes: FlowNode[],
  edges: Edge[]
) => {
  let blob: Blob;
  const safeFileName = fileName.replace(/[^a-z0-9а-яіїєґ]/gi, "_");

  switch (format) {
    case "studycool":
      blob = formatAsStudyCool(safeFileName, nodes, edges);
      break;
    
    case "txt":
    case "md":
    case "docx": {
      const parsedData = parseGraph(nodes, edges);
      
      if (format === "txt") {
        blob = formatAsTxt(safeFileName, parsedData);
      } else if (format === "md") {
        blob = formatAsMarkdown(safeFileName, parsedData);
      } else {
        blob = await formatAsDocx(safeFileName, parsedData);
      }
      break;
    }

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  downloadBlob(blob, `${safeFileName}.${format}`);
};