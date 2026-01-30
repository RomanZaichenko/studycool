"use client"

import Zoomer from "./components/Zoomer";
import { applyNodeChanges, Edge, NodeChange, ReactFlow, Node, EdgeChange, applyEdgeChanges, addEdge, Connection, Background , ConnectionMode} from "@xyflow/react";
import { useCallback, useState } from "react";
import '@xyflow/react/dist/style.css';
import MapNode from "./components/MapNode";

const initialNodes = [
  { id: 'n1', type: "mapNode", position: { x: 0, y: 0 }, data: { label: 'Topic', level: 1 } },
  { id: 'n2', type: "mapNode", position: { x: 150, y: 150 }, data: { label: 'Subtopic', level: 2 } },
  { id: 'n3', type: "mapNode", position: { x: 300, y: 75 }, data: { label: 'Note', level: 3 } },
];
const initialEdges = [{ id: 'n1-n2', source: 'n1', target: 'n2' },
  { id: 'n2-n3', source: 'n2', target: 'n3' }
];

const nodeTypes = {
  mapNode: MapNode,
}

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
        fitView
        panOnScroll
      >
        <Background/>
        <Zoomer/>
      </ReactFlow>
    </div>
  );
}