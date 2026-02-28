"use client"

import Zoomer from "../components/Zoomer";
import { ReactFlow, Background , ConnectionMode,ReactFlowProvider,} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { useMapLogic } from "../hooks/useMapLogic"; 
import { useMapEditorStore } from "@/store/useMapEditorStore";



function MapFlow() {

  const mapLogic = useMapLogic();
  const nodes = useMapEditorStore((s) => s.nodes);
  const edges = useMapEditorStore((s) => s.edges);
  const onNodesChange = useMapEditorStore((s) => s.onNodesChange);
  const onEdgesChange = useMapEditorStore((s) => s.onEdgesChange);
  const onConnect = useMapEditorStore((s) => s.onConnect);
  const onEdgesDelete = useMapEditorStore((s) => s.onEdgesDelete);
  return (
      <div className="w-[100vw] h-[90vh]">
        <ReactFlow 
          nodes={nodes} 
          edges={edges}
          nodeTypes={mapLogic.nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          zoomActivationKeyCode={"Ctrl"}
          deleteKeyCode={"Delete"}
          connectionMode={ConnectionMode.Loose}
          connectionRadius={1}
          proOptions={{ hideAttribution: true }}
          onPaneContextMenu={mapLogic.onPaneContextMenu}
          isValidConnection={mapLogic.isValidConnection}
          onConnectStart={mapLogic.onConnectStart}
          onConnectEnd={mapLogic.onConnectEnd}
          defaultEdgeOptions={{
            type: "bezier",
            
          }}
          fitView
          panOnScroll
        >
          <Background/>
          <Zoomer/>
      </ReactFlow>
    </div>
  );
}

export default function MapArea() {
  return (
    <ReactFlowProvider>
      <MapFlow/>
    </ReactFlowProvider>
  )
}