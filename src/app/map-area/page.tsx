"use client"

import Zoomer from "./components/Zoomer";
import { applyNodeChanges, Edge, NodeChange, ReactFlow, Node, EdgeChange, applyEdgeChanges, addEdge, Connection } from "@xyflow/react";
import { useCallback, useState } from "react";
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: 'n2', position: { x: 0, y: 100 }, data: { label: 'Node 2' } },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' }];

export default function MapArea() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

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

  return (
    <div className="w-[97vw] h-[87vh]">
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>

    // <div id="map-area-page" className="flex">
    //   <Zoomer/>
    // </div>

  );
}