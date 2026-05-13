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
  type IRunOptions,
} from "docx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
    if (rgb.startsWith("#")) return rgb.replace("#", "");
    return undefined;
  }
  const r = parseInt(match[1]).toString(16).padStart(2, "0");
  const g = parseInt(match[2]).toString(16).padStart(2, "0");
  const b = parseInt(match[3]).toString(16).padStart(2, "0");
  return (r + g + b).toUpperCase();
};

const resolveColorToRGB = (colorStr: string): string => {
  if (!colorStr || colorStr === "none" || colorStr === "transparent")
    return "transparent";
  if (
    !colorStr.includes("oklch") &&
    !colorStr.includes("oklab") &&
    !colorStr.includes("color(")
  ) {
    return colorStr;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return colorStr;

  ctx.fillStyle = colorStr;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
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

const fetchImageDataAndSize = async (
  src: string
): Promise<{ buffer: ArrayBuffer; width: number; height: number } | null> => {
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
            type: "png",
          })
        );
      }
    } else {
      let nextFormat: IRunOptions = { ...format };

      if (tag === "b" || tag === "strong")
        nextFormat = { ...nextFormat, bold: true };
      if (tag === "i" || tag === "em")
        nextFormat = { ...nextFormat, italics: true };
      if (tag === "u")
        nextFormat = {
          ...nextFormat,
          underline: { type: UnderlineType.SINGLE },
        };

      const textColor = el.style.color;
      if (textColor) {
        const rgbColor = resolveColorToRGB(textColor);
        const hex = rgbToHex(rgbColor);
        if (hex) nextFormat = { ...nextFormat, color: hex };
      }

      const fontFamily = el.style.fontFamily;
      if (fontFamily) {
        nextFormat = { ...nextFormat, font: fontFamily.replace(/['"]/g, "") };
      }

      const fontSize = el.style.fontSize;
      if (fontSize && fontSize.includes("px")) {
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

const convertHtmlToDocxParagraphs = async (
  html: string
): Promise<Paragraph[]> => {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const paragraphs: Paragraph[] = [];

  for (const element of Array.from(doc.body.children)) {
    const runs = await processHtmlNode(element);
    if (runs.length > 0) {
      paragraphs.push(
        new Paragraph({ children: runs, spacing: { after: 200 } })
      );
    }
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
      title: (node.data?.label as string) || "Нотатка без назви",
      content: convertHtmlToText((node.data?.noteContent as string) || ""),
      rawContent: (node.data?.noteContent as string) || "",
      depth,
    });

    const children = edges.filter((e) => e.source === nodeId);
    children.forEach((e) => dfs(e.target, depth + 1));
  };

  nodes.filter((n) => !targetIds.has(n.id)).forEach((root) => dfs(root.id, 1));

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

const formatAsStudyCool = (
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

const formatAsTxt = (fileName: string, data: GraphData): Blob => {
  let text = `${fileName.toUpperCase()}\n==============================\n\n`;
  data.hierarchical.forEach((node) => {
    const indent = "  ".repeat(node.depth - 1);
    text += `${indent}${node.depth === 1 ? "■ " : "• "}${node.title}\n`;
    if (node.content.trim()) text += `${indent}    ${node.content}\n`;
    text += "\n";
  });
  return new Blob([text], { type: "text/plain; charset=utf-8" });
};

const formatAsMarkdown = (fileName: string, data: GraphData): Blob => {
  const turndown = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });
  let md = `# ${fileName}\n\n`;
  data.hierarchical.forEach((node) => {
    const prefix = node.depth === 1 ? "# " : node.depth === 2 ? "## " : "### ";
    md += `${prefix}${node.title}\n\n${turndown.turndown(node.rawContent)}\n\n`;
  });
  return new Blob([md], { type: "text/markdown; charset=utf-8" });
};

const formatAsDocx = async (
  fileName: string,
  data: GraphData
): Promise<Blob> => {
  const children: Paragraph[] = [
    new Paragraph({
      text: fileName.toUpperCase(),
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    }),
  ];

  for (const node of data.hierarchical) {
    const heading =
      node.depth === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2;
    children.push(
      new Paragraph({
        text: node.title,
        heading,
        spacing: { before: 200, after: 100 },
      })
    );
    if (node.rawContent.trim()) {
      const paragraphs = await convertHtmlToDocxParagraphs(node.rawContent);
      children.push(...paragraphs);
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return await Packer.toBlob(doc);
};

const formatAsPdf = async (
  fileName: string,
  data: GraphData
): Promise<Blob> => {
  const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });

  const margin = 40;
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(fileName.toUpperCase(), contentWidth);
  doc.text(titleLines, pageWidth / 2, cursorY + 20, { align: "center" });
  cursorY += titleLines.length * 28 + 30;

  const renderBlock = async (node: ParsedNode) => {
    const div = document.createElement("div");

    div.style.width = `${contentWidth}pt`;
    div.style.padding = "10px";
    div.style.background = "white";
    div.style.color = "black";
    div.style.fontFamily = "Arial, sans-serif";
    div.style.position = "absolute";
    div.style.left = "-9999px";

    const size = node.depth === 1 ? "18pt" : node.depth === 2 ? "14pt" : "12pt";
    const weight = node.depth <= 3 ? "bold" : "normal";

    const sanitizedHTML = node.rawContent.replace(
      /oklch\([^)]+\)/gi,
      "rgb(0,0,0)"
    );

    div.innerHTML = `
      <div style="font-size: ${size}; font-weight: ${weight}; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px; line-height: 1.3; display: block;">
        ${node.title}
      </div>
      <div style="font-size: 11pt; line-height: 1.6; color: black; word-wrap: break-word;">
        ${sanitizedHTML}
      </div>
    `;

    document.body.appendChild(div);

    const els = div.getElementsByTagName("*");
    for (let i = 0; i < els.length; i++) {
      const el = els[i] as HTMLElement;
      const comp = getComputedStyle(el);

      let color = comp.color;
      let bg = comp.backgroundColor;
      if (color.includes("oklch")) color = "rgb(0,0,0)";
      if (bg.includes("oklch")) bg = "transparent";

      el.style.color = resolveColorToRGB(color);
      el.style.backgroundColor = resolveColorToRGB(bg);
      el.removeAttribute("class");
    }

    const imgs = div.getElementsByTagName("img");
    await Promise.all(
      Array.from(imgs).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((res) => {
          img.onload = res;
          img.onerror = res;
        });
      })
    );

    const canvas = await html2canvas(div, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (clonedDoc) => {
        const allEls = clonedDoc.getElementsByTagName("*");
        for (let i = 0; i < allEls.length; i++) {
          const el = allEls[i] as HTMLElement;
          el.removeAttribute("class");

          if (
            (el.tagName === "SPAN" || el.tagName === "MARK") &&
            el.style.backgroundColor &&
            el.style.backgroundColor !== "transparent" &&
            el.style.backgroundColor !== "rgba(0, 0, 0, 0)"
          ) {
            el.style.position = "relative";
            el.style.top = "4px";
            el.style.zIndex = "0";
            el.style.display = "inline";
            el.style.lineHeight = "inherit";
            el.style.padding = "2px 4px";
            el.style.borderRadius = "3px";
            el.style.boxShadow = "none";

            Array.from(el.childNodes).forEach((child) => {
              if (child.nodeType === 3 && child.textContent?.trim() !== "") {
                const textWrapper = clonedDoc.createElement("span");
                textWrapper.style.position = "relative";
                textWrapper.style.top = "-4px";
                textWrapper.style.zIndex = "1";
                textWrapper.textContent = child.textContent;
                el.replaceChild(textWrapper, child);
              } else if (child.nodeType === 1) {
                const childEl = child as HTMLElement;
                childEl.style.position = "relative";
                childEl.style.top = "-4px";
                childEl.style.zIndex = "1";
              }
            });
          }
        }
        const styles = clonedDoc.querySelectorAll(
          'style, link[rel="stylesheet"]'
        );
        styles.forEach((s) => s.remove());
      },
    });

    document.body.removeChild(div);

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const imgProps = doc.getImageProperties(imgData);
    const pdfImgHeight = (imgProps.height * contentWidth) / imgProps.width;

    if (cursorY + pdfImgHeight > pageHeight - margin) {
      if (pdfImgHeight <= pageHeight - margin * 2) {
        doc.addPage();
        cursorY = margin;
        doc.addImage(
          imgData,
          "JPEG",
          margin,
          cursorY,
          contentWidth,
          pdfImgHeight
        );
        cursorY += pdfImgHeight + 15;
      } else {
        let heightLeft = pdfImgHeight;
        let position = cursorY;
        let sliceOffset = 0;

        while (heightLeft > 0) {
          if (sliceOffset > 0) {
            doc.addPage();
            position = margin;
          }

          doc.addImage(
            imgData,
            "JPEG",
            margin,
            position - sliceOffset,
            contentWidth,
            pdfImgHeight
          );

          const spaceOnThisPage = pageHeight - position - margin;
          heightLeft -= spaceOnThisPage;
          sliceOffset += spaceOnThisPage;
          cursorY =
            margin +
            (spaceOnThisPage > pdfImgHeight ? pdfImgHeight : spaceOnThisPage) +
            15;
        }
      }
    } else {
      doc.addImage(
        imgData,
        "JPEG",
        margin,
        cursorY,
        contentWidth,
        pdfImgHeight
      );
      cursorY += pdfImgHeight + 15;
    }
  };

  for (const node of data.hierarchical) {
    await renderBlock(node);
  }

  if (data.orphans.length > 0) {
    if (cursorY + 50 > pageHeight - margin) {
      doc.addPage();
      cursorY = margin;
    } else {
      cursorY += 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Самотні нотатки", margin, cursorY);
    cursorY += 10;

    doc.setLineWidth(1);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 20;

    for (const node of data.orphans) {
      await renderBlock(node);
    }
  }

  return doc.output("blob");
};

export const processExport = async (
  format: string,
  fileName: string,
  nodes: FlowNode[],
  edges: Edge[]
) => {
  let blob: Blob;
  const safeFileName = fileName.replace(/[^a-z0-9а-яіїєґ]/gi, "_");
  const parsedData = parseGraph(nodes, edges);

  switch (format) {
    case "studycool":
      blob = formatAsStudyCool(safeFileName, nodes, edges);
      break;
    case "txt":
      blob = formatAsTxt(safeFileName, parsedData);
      break;
    case "md":
      blob = formatAsMarkdown(safeFileName, parsedData);
      break;
    case "docx":
      blob = await formatAsDocx(safeFileName, parsedData);
      break;
    case "pdf":
      blob = await formatAsPdf(safeFileName, parsedData);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  downloadBlob(blob, `${safeFileName}.${format}`);
};
