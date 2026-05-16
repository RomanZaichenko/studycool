import { type Node as FlowNode, Edge } from "@xyflow/react";
import { convertHtmlToText } from "./utils";
import TurndownService from "turndown";
import { 
  Document as DocxDocument, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  ImageRun,
  UnderlineType,
  type IRunOptions 
} from "docx";
import { jsPDF } from "jspdf";
import { toBlob, toCanvas } from "html-to-image";

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
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (!match) return rgb.startsWith('#') ? rgb.replace('#', '') : undefined;
  
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  return (r + g + b).toUpperCase();
};

const resolveColorToRGB = (colorStr: string): string => {
  if (!colorStr || colorStr === 'none' || colorStr === 'transparent') return 'transparent';
  if (!/(oklch|oklab|lab|lch|color)\(/i.test(colorStr)) return colorStr;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1; canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 'rgb(0,0,0)';
  
  ctx.fillStyle = colorStr;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
};

const downloadBlob = (blob: Blob, fullFileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = fullFileName;
  document.body.appendChild(link); link.click();
  document.body.removeChild(link); URL.revokeObjectURL(url);
};

const fetchImageDataAndSize = async (src: string): Promise<{ buffer: ArrayBuffer; width: number; height: number } | null> => {
  try {
    const res = await fetch(src);
    const buffer = await res.arrayBuffer();
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width, height = img.height;
        const maxWidth = 550;
        if (width > maxWidth) { height = Math.round((maxWidth / width) * height); width = maxWidth; }
        resolve({ buffer, width, height });
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  } catch { return null; }
};

const processHtmlNode = async (node: Node, format: IRunOptions = {}): Promise<(TextRun | ImageRun)[]> => {
  const runs: (TextRun | ImageRun)[] = [];
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    if (text && text.trim() !== "") runs.push(new TextRun({ ...format, text }));
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (tag === "img") {
      const src = (element as HTMLImageElement).src;
      const imgData = await fetchImageDataAndSize(src);
      if (imgData) runs.push(new ImageRun({ data: imgData.buffer, transformation: { width: imgData.width, height: imgData.height }, type: "png" }));
    } else {
      let nextFormat: IRunOptions = { ...format };
      if (tag === "b" || tag === "strong") nextFormat = { ...nextFormat, bold: true };
      if (tag === "i" || tag === "em") nextFormat = { ...nextFormat, italics: true };
      if (tag === "u") nextFormat = { ...nextFormat, underline: { type: UnderlineType.SINGLE } };

      const bgCol = element.style.backgroundColor || (tag === "mark" ? "rgb(255, 255, 0)" : "");
      if (bgCol && bgCol !== "transparent" && bgCol !== "rgba(0, 0, 0, 0)") {
        const bgHex = rgbToHex(resolveColorToRGB(bgCol));
        if (bgHex) {
          nextFormat = { ...nextFormat, shading: { fill: bgHex } };
        }
      }

      if (element.style.color) {
        const hex = rgbToHex(resolveColorToRGB(element.style.color));
        if (hex) nextFormat = { ...nextFormat, color: hex };
      }
      if (element.style.fontFamily) nextFormat = { ...nextFormat, font: element.style.fontFamily.replace(/['"]/g, '') };
      if (element.style.fontSize && element.style.fontSize.includes('px')) {
        const size = parseInt(element.style.fontSize);
        if (!isNaN(size)) nextFormat = { ...nextFormat, size: size * 1.5 };
      }

      for (const child of Array.from(element.childNodes)) runs.push(...await processHtmlNode(child, nextFormat));
    }
  }
  return runs;
};

const convertHtmlToDocxParagraphs = async (html: string): Promise<Paragraph[]> => {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const paragraphs: Paragraph[] = [];
  for (const element of Array.from(doc.body.children)) {
    const runs = await processHtmlNode(element);
    if (runs.length > 0) paragraphs.push(new Paragraph({ children: runs, spacing: { after: 200 } }));
  }
  return paragraphs;
};



const parseGraph = (nodes: FlowNode[], edges: Edge[]): GraphData => {
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
    edges.filter((e) => e.source === nodeId).forEach((edge) => dfs(edge.target, depth + 1));
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


const formatAsStudyCool = (fileName: string, nodes: FlowNode[], edges: Edge[]): Blob => {
  const metaData = { version: "1.0", mapTitle: fileName, nodes, edges, date: new Date().toISOString() };
  return new Blob([JSON.stringify(metaData)], { type: "application/json" });
};

const formatAsTxt = (fileName: string, data: GraphData, isSingleNote: boolean): Blob => {
  let text = `${fileName.toUpperCase()}\n==============================\n\n`;
  if (isSingleNote && data.hierarchical.length > 0) text += data.hierarchical[0].content;
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

const formatAsMarkdown = (fileName: string, data: GraphData, isSingleNote: boolean): Blob => {
  const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  let md = `# ${fileName}\n\n`;
  if (isSingleNote && data.hierarchical.length > 0) md += `${turndown.turndown(data.hierarchical[0].rawContent)}\n\n`;
  else {
    data.hierarchical.forEach((node) => {
      const prefix = node.depth === 1 ? "# " : node.depth === 2 ? "## " : "### ";
      md += `${prefix}${node.title}\n\n${turndown.turndown(node.rawContent)}\n\n`;
    });
    if (data.orphans.length > 0) {
      md += `---\n\n## Самотні нотатки\n\n`; 
      data.orphans.forEach((node) => { md += `### ${node.title}\n\n${turndown.turndown(node.rawContent)}\n\n`; }); 
    }
  }
  return new Blob([md], { type: "text/markdown; charset=utf-8" });
};

const formatAsDocx = async (fileName: string, data: GraphData, isSingleNote: boolean): Promise<Blob> => {
  const children: Paragraph[] = [new Paragraph({ text: fileName.toUpperCase(), heading: HeadingLevel.TITLE, spacing: { after: 400 } })];
  if (isSingleNote && data.hierarchical.length > 0 && data.hierarchical[0].rawContent.trim()) {
      children.push(...await convertHtmlToDocxParagraphs(data.hierarchical[0].rawContent));
  } else {
    for (const n of data.hierarchical) {
      children.push(new Paragraph({ text: n.title, heading: n.depth === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
      if (n.rawContent.trim()) children.push(...await convertHtmlToDocxParagraphs(n.rawContent));
    }
    if (data.orphans.length > 0) {
      children.push(new Paragraph({ text: "Самотні нотатки", heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }));
      for (const n of data.orphans) {
        children.push(new Paragraph({ text: n.title, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }));
        if (n.rawContent.trim()) children.push(...await convertHtmlToDocxParagraphs(n.rawContent));
      }
    }
  }
  return await Packer.toBlob(new DocxDocument({ sections: [{ children }] }));
};



const formatAsPdf = async (fileName: string, data: GraphData, isSingleNote: boolean): Promise<Blob> => {
  const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const margin = 40, pageWidth = 595.28, pageHeight = 841.89, contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(fileName.toUpperCase(), contentWidth);
  doc.text(titleLines, pageWidth / 2, cursorY + 20, { align: "center" });
  cursorY += (titleLines.length * 28) + 30;

  const renderBlock = async (node: ParsedNode) => {
    const div = document.createElement("div");
    Object.assign(div.style, { 
      width: `${contentWidth}pt`, 
      padding: "10px", 
      background: "white", 
      color: "black", 
      fontFamily: "Arial, sans-serif", 
      position: "fixed", 
      top: "0", 
      left: "0", 
      zIndex: "-9999" 
    });

    let titleHtml = "";
    if (!isSingleNote) titleHtml = `<div style="font-size: ${node.depth === 1 ? '18pt' : '14pt'}; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px; line-height: 1.3; display: block;">${node.title}</div>`;

    const cleanHTML = node.rawContent.replace(/(oklch|oklab|lab|lch|color)\([^)]+\)/gi, 'rgb(0,0,0)');
    div.innerHTML = `${titleHtml}<div style="font-size: 11pt; line-height: 1.6; color: black; word-wrap: break-word;">${cleanHTML}</div>`;
    document.body.appendChild(div);

    const canvas = await toCanvas(div, { pixelRatio: 2, backgroundColor: "#ffffff" });
    document.body.removeChild(div);

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdfImgHeight = (doc.getImageProperties(imgData).height * contentWidth) / doc.getImageProperties(imgData).width;

    if (cursorY + pdfImgHeight > pageHeight - margin) {
        doc.addPage(); cursorY = margin;
        doc.addImage(imgData, "JPEG", margin, cursorY, contentWidth, pdfImgHeight); cursorY += pdfImgHeight + 15;
    } else {
        doc.addImage(imgData, "JPEG", margin, cursorY, contentWidth, pdfImgHeight); cursorY += pdfImgHeight + 15;
    }
  };

  for (const node of data.hierarchical) await renderBlock(node);
  return doc.output("blob");
};

const formatAsRasterImage = async (format: 'png' | 'jpeg', isSingleNote: boolean, nodes: FlowNode[]): Promise<Blob> => {
  let targetElement: HTMLElement;
  let explicitWidth: number | undefined;
  let explicitHeight: number | undefined;
  let cleanup = () => {};

  if (isSingleNote) {
    targetElement = document.createElement("div");
    Object.assign(targetElement.style, { 
      width: "800px", padding: "40px", background: "white", color: "black", 
      fontFamily: "Arial, sans-serif", position: "absolute", left: "-9999px", textAlign: "center" 
    });
    const rawHTML = nodes[0].data?.noteContent as string || "";
    
    targetElement.innerHTML = `
      <h1 style="margin-top:0; border-bottom: 2px solid #eaeaea; padding-bottom: 15px; font-size: 32px; text-align:center; color: black;">${nodes[0].data?.label || 'Нотатка'}</h1>
      <div style="font-size: 18px; line-height: 1.6; text-align:center; color: black; margin-top: 20px;">${rawHTML}</div>
    `;
    document.body.appendChild(targetElement);
    cleanup = () => document.body.removeChild(targetElement);
  } else {
    targetElement = document.querySelector('.react-flow') as HTMLElement;
    if (!targetElement) throw new Error("React Flow container element not found");
    explicitWidth = targetElement.offsetWidth;
    explicitHeight = targetElement.offsetHeight;
  }

  await Promise.all(Array.from(targetElement.getElementsByTagName('img')).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
  }));

  let styleTag: HTMLStyleElement | null = null;

  if (!isSingleNote) {
    styleTag = document.createElement('style');
    styleTag.innerHTML = `
      .react-flow__controls,
      .react-flow__controls-button,
      .react-flow__minimap,
      .react-flow__attribution,
      .react-flow__panel,
      .react-flow__toolbar,
      button {
        display: none !important;
      }

      .react-flow,
      .react-flow__renderer,
      .react-flow__pane,
      .react-flow__viewport {
        background: transparent !important;
        background-color: transparent !important;
        overflow: visible !important;
      }

      .react-flow__node {
        overflow: visible !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
      }

      .react-flow__node * {
        overflow: visible !important;
        text-align: center !important;
      }

      .react-flow__edges,
      .react-flow__edge,
      svg {
        overflow: visible !important;
      }

      .react-flow__edge-path {
        stroke: #b1b1b7 !important;
        stroke-width: 2px !important;
        fill: none !important;
        opacity: 1 !important;
      }

      svg {
        overflow: visible !important;
      }
    `;
    targetElement.appendChild(styleTag);

    const edgePaths = targetElement.querySelectorAll('.react-flow__edge-path');
    edgePaths.forEach((edge: Element) => {
      const path = edge as SVGPathElement;
      path.setAttribute('stroke', '#b1b1b7');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '1');
      path.style.display = 'block';
      path.style.visibility = 'visible';
    });

    const markers = targetElement.querySelectorAll('marker');
    markers.forEach((marker: Element) => {
      (marker as SVGElement).style.overflow = 'visible';
    });

    const svgs = targetElement.querySelectorAll('svg');
    svgs.forEach((svg: Element) => {
      const svgEl = svg as SVGElement;
      svgEl.style.overflow = 'visible';
      svgEl.style.position = 'absolute';
    });

    if (format === 'png') {
      targetElement.querySelectorAll('.react-flow__background').forEach((el: Element) => {
        (el as HTMLElement).style.setProperty('display', 'none', 'important');
      });
    }

    const viewport = targetElement.querySelector('.react-flow__viewport') as HTMLElement;
    if (viewport && explicitWidth && explicitHeight) {
      viewport.style.transform = 'translate(0px, 0px) scale(1)';
      viewport.style.width = `${explicitWidth}px`;
      viewport.style.height = `${explicitHeight}px`;
    }
  }

  try {
    const blob = await toBlob(targetElement, {
      backgroundColor: format === 'jpeg' || isSingleNote ? '#ffffff' : undefined, 
      pixelRatio: 2,
      cacheBust: true,
    });

    if (!blob) throw new Error("Image conversion failed");
    return blob;
  } finally {
    if (styleTag) styleTag.remove();
    cleanup();
  }
};

const formatAsSvgImage = async (isSingleNote: boolean, nodes: FlowNode[]): Promise<Blob> => {
  const pngBlob = await formatAsRasterImage('png', isSingleNote, nodes);
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(pngBlob);
  });

  const img = new Image();
  await new Promise((resolve) => { img.onload = resolve; img.src = dataUrl; });

  const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
  const width = isSingleNote ? 800 : reactFlowElement?.offsetWidth || 800;
  const height = isSingleNote ? Math.round(img.height / 2) : reactFlowElement?.offsetHeight || 600;

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="${dataUrl}" width="${width}" height="${height}" /></svg>`;
  return new Blob([svgString], { type: "image/svg+xml; charset=utf-8" });
};


export const processExport = async (
  format: string,
  fileName: string,
  nodes: FlowNode[],
  edges: Edge[],
  activeNodeId?: string
) => {
  let blob: Blob;
  const safeFileName = fileName.replace(/[^a-z0-9а-яіїєґ]/gi, "_");
  
  const isSingleNote = !!activeNodeId || (nodes.length === 1 && edges.length === 0);
  
  const nodesToProcess = activeNodeId ? nodes.filter(n => n.id === activeNodeId) : nodes;
  const edgesToProcess = activeNodeId ? [] : edges;

  const parsedData = parseGraph(nodesToProcess, edgesToProcess);

  switch (format.toLowerCase()) {
    case "studycool": 
      blob = formatAsStudyCool(safeFileName, nodes, edges);
      break;
    case "txt": blob = formatAsTxt(safeFileName, parsedData, isSingleNote); break;
    case "md": blob = formatAsMarkdown(safeFileName, parsedData, isSingleNote); break;
    case "docx": blob = await formatAsDocx(safeFileName, parsedData, isSingleNote); break;
    case "pdf": blob = await formatAsPdf(safeFileName, parsedData, isSingleNote); break;
    case "png": blob = await formatAsRasterImage('png', isSingleNote, nodesToProcess); break;
    case "jpeg": case "jpg": blob = await formatAsRasterImage('jpeg', isSingleNote, nodesToProcess); break;
    case "svg": blob = await formatAsSvgImage(isSingleNote, nodesToProcess); break;
    default: throw new Error(`Unsupported format: ${format}`);
  }

  downloadBlob(blob, `${safeFileName}.${format.toLowerCase()}`);
};