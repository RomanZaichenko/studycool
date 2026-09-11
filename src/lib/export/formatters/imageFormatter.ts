import { toBlob } from "html-to-image";
import { type Node as FlowNode } from "@xyflow/react";

export const formatAsRasterImage = async (
  format: "png" | "jpeg",
  isSingleNote: boolean,
  nodes: FlowNode[]
): Promise<Blob> => {
  let targetElement: HTMLElement;
  let explicitWidth: number | undefined;
  let explicitHeight: number | undefined;
  let cleanup = () => {};

  if (isSingleNote) {
    targetElement = document.createElement("div");
    Object.assign(targetElement.style, {
      width: "800px",
      padding: "40px",
      background: "white",
      color: "black",
      fontFamily: "Arial, sans-serif",
      position: "absolute",
      left: "-9999px",
      textAlign: "center",
    });
    const rawHTML = (nodes[0].data?.noteContent as string) || "";

    targetElement.innerHTML = `
      <h1 style="margin-top:0; border-bottom: 2px solid #eaeaea; padding-bottom: 15px; font-size: 32px; text-align:center; color: black;">${nodes[0].data?.label || "Нотатка"}</h1>
      <div style="font-size: 18px; line-height: 1.6; text-align:center; color: black; margin-top: 20px;">${rawHTML}</div>
    `;
    document.body.appendChild(targetElement);
    cleanup = () => document.body.removeChild(targetElement);
  } else {
    targetElement = document.querySelector(".react-flow") as HTMLElement;
    if (!targetElement)
      throw new Error("React Flow container element not found");
    explicitWidth = targetElement.offsetWidth;
    explicitHeight = targetElement.offsetHeight;
  }

  await Promise.all(
    Array.from(targetElement.getElementsByTagName("img")).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  let styleTag: HTMLStyleElement | null = null;

  if (!isSingleNote) {
    styleTag = document.createElement("style");
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

    const edgePaths = targetElement.querySelectorAll(".react-flow__edge-path");
    edgePaths.forEach((edge: Element) => {
      const path = edge as SVGPathElement;
      path.setAttribute("stroke", "#b1b1b7");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("fill", "none");
      path.setAttribute("opacity", "1");
      path.style.display = "block";
      path.style.visibility = "visible";
    });

    const markers = targetElement.querySelectorAll("marker");
    markers.forEach((marker: Element) => {
      (marker as SVGElement).style.overflow = "visible";
    });

    const svgs = targetElement.querySelectorAll("svg");
    svgs.forEach((svg: Element) => {
      const svgEl = svg as SVGElement;
      svgEl.style.overflow = "visible";
      svgEl.style.position = "absolute";
    });

    if (format === "png") {
      targetElement
        .querySelectorAll(".react-flow__background")
        .forEach((el: Element) => {
          (el as HTMLElement).style.setProperty("display", "none", "important");
        });
    }

    const viewport = targetElement.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement;
    if (viewport && explicitWidth && explicitHeight) {
      viewport.style.transform = "translate(0px, 0px) scale(1)";
      viewport.style.width = `${explicitWidth}px`;
      viewport.style.height = `${explicitHeight}px`;
    }
  }

  try {
    const blob = await toBlob(targetElement, {
      backgroundColor:
        format === "jpeg" || isSingleNote ? "#ffffff" : undefined,
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

export const formatAsSvgImage = async (
  isSingleNote: boolean,
  nodes: FlowNode[]
): Promise<Blob> => {
  const pngBlob = await formatAsRasterImage("png", isSingleNote, nodes);
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(pngBlob);
  });

  const img = new Image();
  await new Promise((resolve) => {
    img.onload = resolve;
    img.src = dataUrl;
  });

  const reactFlowElement = document.querySelector(".react-flow") as HTMLElement;
  const width = isSingleNote ? 800 : reactFlowElement?.offsetWidth || 800;
  const height = isSingleNote
    ? Math.round(img.height / 2)
    : reactFlowElement?.offsetHeight || 600;

  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="${dataUrl}" width="${width}" height="${height}" /></svg>`;
  return new Blob([svgString], { type: "image/svg+xml; charset=utf-8" });
};