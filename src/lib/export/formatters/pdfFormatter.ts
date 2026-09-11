import { jsPDF } from "jspdf";
import { toCanvas } from "html-to-image";
import { GraphData, ParsedNode } from "../graph";

export const formatAsPdf = async (
  fileName: string,
  data: GraphData,
  isSingleNote: boolean
): Promise<Blob> => {
  const doc = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const margin = 40,
    pageWidth = 595.28,
    pageHeight = 841.89,
    contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(fileName.toUpperCase(), contentWidth);
  doc.text(titleLines, pageWidth / 2, cursorY + 20, { align: "center" });
  cursorY += titleLines.length * 28 + 30;

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
      zIndex: "-9999",
    });

    let titleHtml = "";
    if (!isSingleNote)
      titleHtml = `<div style="font-size: ${node.depth === 1 ? "18pt" : "14pt"}; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 8px; line-height: 1.3; display: block;">${node.title}</div>`;

    const cleanHTML = node.rawContent.replace(
      /(oklch|oklab|lab|lch|color)\([^)]+\)/gi,
      "rgb(0,0,0)"
    );
    div.innerHTML = `${titleHtml}<div style="font-size: 11pt; line-height: 1.6; color: black; word-wrap: break-word;">${cleanHTML}</div>`;
    document.body.appendChild(div);

    const canvas = await toCanvas(div, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });
    document.body.removeChild(div);

    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdfImgHeight =
      (doc.getImageProperties(imgData).height * contentWidth) /
      doc.getImageProperties(imgData).width;

    if (cursorY + pdfImgHeight > pageHeight - margin) {
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

  for (const node of data.hierarchical) await renderBlock(node);
  return doc.output("blob");
};
