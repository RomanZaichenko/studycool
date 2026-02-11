"use client"

import Zoomer from "./components/Zoomer";
import { ReactFlow, Background , ConnectionMode,ReactFlowProvider,} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { useMapLogic } from "./hooks/useMapLogic"; 

function MapFlow() {

  const mapLogic = useMapLogic();

  return (
      <div className="w-[100vw] h-[90vh]">
        <ReactFlow 
          nodes={mapLogic.nodes} 
          edges={mapLogic.edges}
          nodeTypes={mapLogic.nodeTypes}
          onNodesChange={mapLogic.onNodesChange}
          onEdgesChange={mapLogic.onEdgesChange}
          onConnect={mapLogic.onConnect}
          onEdgesDelete={mapLogic.onEdgesDelete}
          zoomActivationKeyCode={"Ctrl"}
          deleteKeyCode={"Delete"}
          connectionMode={ConnectionMode.Loose}
          connectionRadius={20}
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