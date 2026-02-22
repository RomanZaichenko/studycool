import { Handle, Position, NodeProps, Node } from "@xyflow/react";
import { Fragment } from "react";

type MapNodeData = Node<{
  label: string;
  level: 1 | 2 | 3;
}>;


const LEVEL_STYLES: Record<1 | 2 | 3, string> = {
  1: "text-2xl bg-[var(--node-bg-1)] text-[var(--node-text-1)] border-[var(--node-border-1)] p-5 border-3 font-victor font-black rounded-md z-20",
  2: "text-xl bg-[var(--node-bg-2)] text-[var(--node-text-2)] border-[var(--node-border-2)] p-4 border-2 font-victor font-bold rounded-md",
  3: "text-lg bg-[#F9F8FC] text-slate-600 p-3 border font-medium font-victor rounded-md border-[#E4E1EB] bg-opacity-100 ",
};

const HANDLE_CONFIGS = [
  // --- Right ---
  { id: "rtc", pos: Position.Right, handleClasses: "!right-[0] !top-0", dotClasses: "!right-[-5] !top-[-3]" },
  { id: "r", pos: Position.Right, handleClasses: "!right-[-2] !top-[47%]", dotClasses: "!right-[-5] !top-[45%]" },
  { id: "rbc", pos: Position.Right, handleClasses: "!right-[0] !top-[95%]", dotClasses: "!right-[-5] !top-[92%]" },
  
  // --- Bottom ---
  { id: "bml", pos: Position.Bottom, handleClasses: "!left-1/4 !bottom-[-2]", dotClasses: "!left-1/4 !bottom-[-5]" },
  { id: "b", pos: Position.Bottom, handleClasses: "!left-1/2 !bottom-[-2]", dotClasses: "!left-1/2 !bottom-[-5]" },
  { id: "bmr", pos: Position.Bottom, handleClasses: "!left-3/4 !bottom-[-2]", dotClasses: "!left-3/4 !bottom-[-5]" },

  // --- Left ---
  { id: "ltc", pos: Position.Left, handleClasses: "!left-[-2] !top-[-3]", dotClasses: "!left-[-5] !top-[-3]" },
  { id: "l", pos: Position.Left, handleClasses: "!left-[-2] !top-[47%]", dotClasses: "!left-[-5] !top-[45%]" },
  { id: "lbc", pos: Position.Left, handleClasses: "!left-[0] !top-[92%]", dotClasses: "!left-[-5] !top-[92%]" },

  // --- Top ---
  { id: "tml", pos: Position.Top, handleClasses: "!left-1/4 !top-[-2]", dotClasses: "!left-1/4 !top-[-5]" },
  { id: "t", pos: Position.Top, handleClasses: "!left-1/2 !top-[-2]", dotClasses: "!left-1/2 !top-[-5]" },
  { id: "tmr", pos: Position.Top, handleClasses: "!left-3/4 !top-[-2]", dotClasses: "!left-3/4 !top-[-5]" },
] as const;

export default function MapNode({ data }: NodeProps<MapNodeData>) {
  const { label, level } = data;

  const componentStyles = LEVEL_STYLES[level];

  const invisibleHandleStyle = `!w-0 !h-0 !bg-transparent !border-0 !transform-none pointer-events-auto`;
  const visibleCircleStyle = `absolute w-2 h-2 bg-[#504679] border-2 border-white rounded-full shadow-sm z-40 opacity-0 group-hover:opacity-100 pointer-events-none`;

  return (
    <div className={`relative group min-w-[150px] text-center ${componentStyles}`}>
      {label}

      {HANDLE_CONFIGS.map(({ id, pos, handleClasses, dotClasses }) => (
        <Fragment key={id}>
          <Handle
            type="source"
            position={pos}
            id={id}
            className={`${invisibleHandleStyle} ${handleClasses}`}
          />
          
          <div className={`${visibleCircleStyle} ${dotClasses}`} />
        </Fragment>
      ))}
    </div>
  );
}