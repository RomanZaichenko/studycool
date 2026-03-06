"use client";

import Zoomer from "../components/Zoomer";
import {
  ReactFlow,
  Background,
  ConnectionMode,
  ReactFlowProvider,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMapLogic } from "../hooks/useMapLogic";
import { useMapEditorStore } from "@/store/useMapEditorStore";
import { useEffect } from "react";
import { useMainStore } from "@/store/useMainStore";
import { useParams } from "next/navigation";
import { updateTag } from "next/cache";

function MapFlow() {
  const mapLogic = useMapLogic();
  const currentMapId = useMapEditorStore((state) => state.currentMapId)
  const nodes = useMapEditorStore((state) => state.nodes);
  const edges = useMapEditorStore((state) => state.edges);
  const onNodesChange = useMapEditorStore((state) => state.onNodesChange);
  const onEdgesChange = useMapEditorStore((state) => state.onEdgesChange);
  const onConnect = useMapEditorStore((state) => state.onConnect);
  const onEdgesDelete = useMapEditorStore((state) => state.onEdgesDelete);
  

  useEffect(() => {
    if (currentMapId !== null && (nodes.length > 0 || edges.length > 0)) {
      const dataToSave = JSON.stringify({ nodes, edges });
      localStorage.setItem(`map_data_${currentMapId}`, dataToSave);
    }

  }, [nodes, edges, currentMapId])

  return (
    <div className="h-[90vh] w-[100vw]">
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
        <Background />
        <Zoomer />
      </ReactFlow>
    </div>
  );
}

export default function MapArea() {
  const params = useParams();
  const mapId = Number(params.id);
  const loadMapData = useMapEditorStore((state) => state.loadMapData);
  const resetMap = useMapEditorStore((state) => state.resetMap);
  const updateLastOpened = useMainStore((state) => state.updateMapAccessTime);

  useEffect(() => {
    if (!mapId) return;
    updateLastOpened(mapId);
    const savedMapData = localStorage.getItem(`map_data_${mapId}`);
    let fetchedNodes: Node[] = [];
    let fetchedEdges: Edge[] = [];

    if (savedMapData) {
      const parsedData = JSON.parse(savedMapData);
      fetchedNodes = parsedData.nodes || [];
      fetchedEdges = parsedData.edges || [];
    }

    loadMapData(mapId, fetchedNodes, fetchedEdges);

    return () => resetMap();
  }, [mapId, loadMapData, resetMap, updateLastOpened]);

  return (
    <ReactFlowProvider>
      <MapFlow />
    </ReactFlowProvider>
  );
}
