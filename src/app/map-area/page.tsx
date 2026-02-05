"use client"

import Zoomer from "./components/Zoomer";
import { applyNodeChanges, Edge, NodeChange, ReactFlow, Node, EdgeChange, applyEdgeChanges, addEdge, Connection, Background , ConnectionMode, useReactFlow, ReactFlowProvider} from "@xyflow/react";
import { useCallback, useState } from "react";
import '@xyflow/react/dist/style.css';
import MapNode from "./components/MapNode";

const initialNodes : Node[] = [];
const initialEdges : Edge[] = [];

const nodeTypes = {
  mapNode: MapNode,
}

function MapFlow() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const {screenToFlowPosition} = useReactFlow()

  const onNodesChange = useCallback( 
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => 
      applyNodeChanges(changes,nodesSnapshot)), []
  );

  const onEdgesChange = useCallback(
    (changes:  EdgeChange[]) => setEdges((edgesSnapshot) =>
      applyEdgeChanges(changes, edgesSnapshot)), []
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((edgesSnapshot) => 
      addEdge(params, edgesSnapshot)), []
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      })

      const newNode = {
        id: `node-${Date.now()}`,
        type: 'mapNode',
        position,
        data: {label: "New node", level: 1},
        origin: [0.5, 0.5] as [number, number]
      }

      setNodes((nodes) => nodes.concat(newNode))
    },
    [screenToFlowPosition, setNodes]
  )

  return (
      <div className="w-[100vw] h-[90vh]">
        <ReactFlow 
          nodes={nodes} 
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          zoomActivationKeyCode={"Ctrl"}
          deleteKeyCode={"Delete"}
          connectionMode={ConnectionMode.Loose}
          connectionRadius={20}
          onPaneContextMenu={onPaneContextMenu}
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