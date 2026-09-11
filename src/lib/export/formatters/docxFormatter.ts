import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ImageRun,
  UnderlineType,
  type IRunOptions,
} from "docx";

import { rgbToHex, resolveColorToRGB } from "../colors";
import { GraphData } from "../graph";



const fetchImageDataAndSize = async (
  src: string
): Promise<{ buffer: ArrayBuffer; width: number; height: number } | null> => {
  try {
    const res = await fetch(src);
    const buffer = await res.arrayBuffer();
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width,
          height = img.height;
        const maxWidth = 550;
        if (width > maxWidth) {
          height = Math.round((maxWidth / width) * height);
          width = maxWidth;
        }
        resolve({ buffer, width, height });
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
    if (text && text.trim() !== "") runs.push(new TextRun({ ...format, text }));
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    if (tag === "img") {
      const src = (element as HTMLImageElement).src;
      const imgData = await fetchImageDataAndSize(src);
      if (imgData)
        runs.push(
          new ImageRun({
            data: imgData.buffer,
            transformation: { width: imgData.width, height: imgData.height },
            type: "png",
          })
        );
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

      const bgCol =
        element.style.backgroundColor ||
        (tag === "mark" ? "rgb(255, 255, 0)" : "");
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
      if (element.style.fontFamily)
        nextFormat = {
          ...nextFormat,
          font: element.style.fontFamily.replace(/['"]/g, ""),
        };
      if (element.style.fontSize && element.style.fontSize.includes("px")) {
        const size = parseInt(element.style.fontSize);
        if (!isNaN(size)) nextFormat = { ...nextFormat, size: size * 1.5 };
      }

      for (const child of Array.from(element.childNodes))
        runs.push(...(await processHtmlNode(child, nextFormat)));
    }
  }
  return runs;
};


const convertHtmlToDocxParagraphs = async (
  html: string
): Promise<Paragraph[]> => {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const paragraphs: Paragraph[] = [];
  for (const element of Array.from(doc.body.children)) {
    const runs = await processHtmlNode(element);
    if (runs.length > 0)
      paragraphs.push(
        new Paragraph({ children: runs, spacing: { after: 200 } })
      );
  }
  return paragraphs;
};

export const formatAsDocx = async (
  fileName: string,
  data: GraphData,
  isSingleNote: boolean
): Promise<Blob> => {
  const children: Paragraph[] = [
    new Paragraph({
      text: fileName.toUpperCase(),
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
    }),
  ];
  if (
    isSingleNote &&
    data.hierarchical.length > 0 &&
    data.hierarchical[0].rawContent.trim()
  ) {
    children.push(
      ...(await convertHtmlToDocxParagraphs(data.hierarchical[0].rawContent))
    );
  } else {
    for (const n of data.hierarchical) {
      children.push(
        new Paragraph({
          text: n.title,
          heading:
            n.depth === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        })
      );
      if (n.rawContent.trim())
        children.push(...(await convertHtmlToDocxParagraphs(n.rawContent)));
    }
    if (data.orphans.length > 0) {
      children.push(
        new Paragraph({
          text: "Самотні нотатки",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
      for (const n of data.orphans) {
        children.push(
          new Paragraph({
            text: n.title,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
        if (n.rawContent.trim())
          children.push(...(await convertHtmlToDocxParagraphs(n.rawContent)));
      }
    }
  }
  return await Packer.toBlob(new DocxDocument({ sections: [{ children }] }));
};