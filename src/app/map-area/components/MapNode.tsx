import { Handle, Position, NodeProps, Node, } from "@xyflow/react";

type MapNodeData = Node<{
  label: string;
  level: 1 | 2 | 3;
}>;

export default function MapNode({data} : NodeProps<MapNodeData>) {
  const {label, level} = data

  let componentStyles: string;

  switch (level){
    case 1:
      componentStyles="text-2xl bg-[#554D70] text-white p-5 border-3  font-victor font-black rounded-md border-[#333] z-20"
      break;

    case 2:
      componentStyles="text-xl bg-[#DCD6E5] text-[#504679] p-4 border-2 font-victor font-bold rounded-md border-[#B6ACC4]";
      break;

    case 3:
      componentStyles="text-lg bg-[#F9F8FC] text-slate-600 p-3 border-1  font-victor rounded-md border-[#E4E1EB]"
      break;
  }

  const invisibleHandleStyle = `!w-0 !h-0 !bg-transparent !border-0 
    !transform-none pointer-events-auto`;

  const visibleCircleStyle = `w-2 h-2 bg-[#504679] border-2 border-white 
    rounded-full shadow-sm absolute z-40 opacity-0 
    group-hover:opacity-100 pointer-events-none`;

  return(
    <div className={`relative group min-w-[150px] text-center 
      ${componentStyles}`}>

      {label}

       {/* Right handles */}
      <Handle type="source" position={Position.Right} 
        className={`!right-[-2] !top-0 ${invisibleHandleStyle}`} id="rtc" />
      
      <div className={`!right-[-5] !top-[-3] ${visibleCircleStyle}`}/>
      
      <Handle type="source" position={Position.Right} id="r"
        className={`!right-[-2] !top-[47%] ${invisibleHandleStyle}`} />

      <div className={`!right-[-5] !top-[47%] ${visibleCircleStyle}`}/>

      <Handle type="source" position={Position.Right}
        className={`!right-[-2] !top-[95%] ${invisibleHandleStyle}`} id="rbc"/>

      <div className={`!right-[-5] !top-[95%] ${visibleCircleStyle}`}/>

      {/* Bottom handles */}
      <Handle type="source" position={Position.Bottom} 
        className={`!left-1/4 !bottom-[-2] ${invisibleHandleStyle}`} id="bml"/>
      
      <div className={`!left-1/4 !bottom-[-5] ${visibleCircleStyle}`}/>

      <Handle type="source" position={Position.Bottom} id="b"
        className={`!left-1/2 !bottom-[-2] ${invisibleHandleStyle}`} />

      <div className={`!left-1/2 !bottom-[-5] ${visibleCircleStyle}`}/>

      <Handle type="source" position={Position.Bottom}
        className={`!left-3/4 !bottom-[-2] ${invisibleHandleStyle}`} id="bmr"/>

      <div className={`!left-3/4 !bottom-[-5] ${visibleCircleStyle}`}/>

      {/* Left handles */}
      <Handle type="source" position={Position.Left} 
        className={`!left-[-2] !top-[-3] ${invisibleHandleStyle}`} id="ltc" />
      
      <div className={`!left-[-5] !top-[-3] ${visibleCircleStyle}`}/>
      
      <Handle type="source" position={Position.Left} id="l"
        className={`!left-[-2] !top-[47%] ${invisibleHandleStyle}`} />

      <div className={`!left-[-5] !top-[47%] ${visibleCircleStyle}`}/>
      
      <Handle type="source" position={Position.Left}
        className={`!left-[-5] !top-[95%] ${invisibleHandleStyle}`} id="lbc" />

      <div className={`!left-[-5] !top-[95%] ${visibleCircleStyle}`}/>

      {/* Top handles */}
      <Handle type="source" position={Position.Top} 
        className={`!left-1/4 !top-[-2] ${invisibleHandleStyle}`} id="tml" />

      <div className={`!left-1/4 !top-[-5] ${visibleCircleStyle}`}/>
      
      <Handle type="source" position={Position.Top} id="t"
        className={`!left-1/2 !top-[-2] ${invisibleHandleStyle}`} />

      <div className={`!left-1/2 !top-[-5] ${visibleCircleStyle}`}/>
      
      <Handle type="source" position={Position.Top}
        className={`!left-3/4 !top-[-2] ${invisibleHandleStyle}`} id="tmr" />

      <div className={`!left-3/4 !top-[-5] ${visibleCircleStyle}`}/>
    </div>
  )
}  