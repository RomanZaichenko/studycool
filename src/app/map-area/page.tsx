"use client"

import Zoomer from "./components/Zoomer";
import { applyNodeChanges, Edge, NodeChange, ReactFlow, Node, EdgeChange, applyEdgeChanges, addEdge, Connection, Background , ConnectionMode, useReactFlow, ReactFlowProvider, OnConnectStartParams} from "@xyflow/react";
import { useCallback, useRef, useState } from "react";
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

  const {screenToFlowPosition, getEdges} = useReactFlow()
  
  const connectionStartRef = useRef<OnConnectStartParams>(null)

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

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (connection.source === connection.target) return false;

      const currentEdges = getEdges()

      const isDuplicate = currentEdges.some((edge) => {
        const isDirect = edge.source === connection.source &&
          edge.target === connection.target

        const isReverse = edge.source === connection.target &&
          edge.target === connection.source

        return isReverse || isDirect
      })

      return !isDuplicate
    }, [getEdges]
  )

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


  const onConnectStart = useCallback((event : MouseEvent | TouchEvent,
    params: OnConnectStartParams) => {
    connectionStartRef.current = params
  }, [])

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent)=> {
    const target = event.target as Element;
    const isPane = target.classList.contains('react-flow__pane');
    
    if (isPane && connectionStartRef.current) {
      const {clientX, clientY} = 'changedTouches' in event ? 
        event.changedTouches[0] : event;

      const position = screenToFlowPosition({
        x: clientX,
        y: clientY
      })

      const newNodeId = `node-${Date.now()}`;
      const newNode : Node = {
        id: newNodeId,
        type: "mapNode",
        position,
        data: {label: "New Node", level: 2},
        origin: [0.5, 0.5] as [number, number]
      }

      const {nodeId, handleType, handleId} = connectionStartRef.current
      
      const idTranslate: Record<string, string> = {
        "rtc": "l",
        "r": "l",
        "rbc": "l",
        "bml": "t",
        "bmr": "t",
        "b": "t",
        "ltc": "r",
        "l": "r",
        "lbc": "r",
        "tml": "b",
        "tmr": "b",
        "t": "b"
      }

      const endHandleId = idTranslate[handleId as string];



      const newEdge : Edge = {
        id: `e-${newNodeId}-${nodeId}`,
        source: handleType === 'source' ? nodeId! : newNodeId,
        target: handleType === 'source' ? newNodeId : nodeId!,
        sourceHandle: handleType === 'source' ? handleId : endHandleId,
        targetHandle: handleType === 'target' ? handleId : endHandleId,
        type: 'bezier'
      }

      setNodes((nodes) => nodes.concat(newNode))
      setEdges((edges) => edges.concat(newEdge))
    }
  
  }, [screenToFlowPosition, setNodes, setEdges])
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
          isValidConnection={isValidConnection}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
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