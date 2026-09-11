import { downloadBlob } from "./download";
import { parseGraph } from "./graph";
import { formatAsStudyCool } from "./formatters/studycoolFormatter";
import { formatAsTxt } from "./formatters/txtFormatter";
import { formatAsMarkdown } from "./formatters/markdownFormatter";
import { formatAsDocx } from "./formatters/docxFormatter";
import { formatAsPdf } from "./formatters/pdfFormatter";
import {
  formatAsRasterImage,
  formatAsSvgImage,
} from "./formatters/imageFormatter";
import { type Node as FlowNode, Edge } from "@xyflow/react";

export const processExport = async (
  format: string,
  fileName: string,
  nodes: FlowNode[],
  edges: Edge[],
  activeNodeId?: string
) => {
  let blob: Blob;
  const safeFileName = fileName.replace(/[^a-z0-9а-яіїєґ]/gi, "_");

  const isSingleNote =
    !!activeNodeId || (nodes.length === 1 && edges.length === 0);

  const nodesToProcess = activeNodeId
    ? nodes.filter((n) => n.id === activeNodeId)
    : nodes;
  const edgesToProcess = activeNodeId ? [] : edges;

  const parsedData = parseGraph(nodesToProcess, edgesToProcess);

  switch (format.toLowerCase()) {
    case "studycool":
      blob = formatAsStudyCool(safeFileName, nodes, edges);
      break;
    case "txt":
      blob = formatAsTxt(safeFileName, parsedData, isSingleNote);
      break;
    case "md":
      blob = formatAsMarkdown(safeFileName, parsedData, isSingleNote);
      break;
    case "docx":
      blob = await formatAsDocx(safeFileName, parsedData, isSingleNote);
      break;
    case "pdf":
      blob = await formatAsPdf(safeFileName, parsedData, isSingleNote);
      break;
    case "png":
      blob = await formatAsRasterImage("png", isSingleNote, nodesToProcess);
      break;
    case "jpeg":
    case "jpg":
      blob = await formatAsRasterImage("jpeg", isSingleNote, nodesToProcess);
      break;
    case "svg":
      blob = await formatAsSvgImage(isSingleNote, nodesToProcess);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  downloadBlob(blob, `${safeFileName}.${format.toLowerCase()}`);
};
