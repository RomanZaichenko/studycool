export const rgbToHex = (rgb: string): string | undefined => {
  const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
  if (!match) return rgb.startsWith("#") ? rgb.replace("#", "") : undefined;

  const r = parseInt(match[1]).toString(16).padStart(2, "0");
  const g = parseInt(match[2]).toString(16).padStart(2, "0");
  const b = parseInt(match[3]).toString(16).padStart(2, "0");
  return (r + g + b).toUpperCase();
};

export const resolveColorToRGB = (colorStr: string): string => {
  if (!colorStr || colorStr === "none" || colorStr === "transparent")
    return "transparent";
  if (!/(oklch|oklab|lab|lch|color)\(/i.test(colorStr)) return colorStr;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "rgb(0,0,0)";

  ctx.fillStyle = colorStr;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
};