"use client";

import { useReactFlow } from "@xyflow/react";
import { Minus, Plus } from "lucide-react";

export default function Zoomer() {
  const { zoomIn, zoomOut } = useReactFlow();

  const buttonStyles = `
  w-12 h-12 
  bg-white border border-gray-300 rounded-md
  flex items-center justify-center 
  leading-none 
  transition-all active:scale-95
  shadow-sm text-gray-500
  overflow-hidden cursor-pointer
`;
  return (
    <div className="nopan fixed right-10 bottom-10 z-50 flex flex-col gap-2">
      <button className={buttonStyles} onClick={() => zoomIn()}>
        <Plus strokeWidth={2.5} className="h-7 w-7" />
      </button>
      <button className={buttonStyles} onClick={() => zoomOut()}>
        <Minus strokeWidth={2.5} className="h-7 w-7" />
      </button>
    </div>
  );
}
