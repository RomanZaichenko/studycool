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
import NoteEditor from "@/app/map-area/components/NoteEditor";

function MapFlow() {
  const mapLogic = useMapLogic();
  const currentMapId = useMapEditorStore((state) => state.currentMapId);
  const nodes = useMapEditorStore((state) => state.nodes);
  const edges = useMapEditorStore((state) => state.edges);
  const onNodesChange = useMapEditorStore((state) => state.onNodesChange);
  const onEdgesChange = useMapEditorStore((state) => state.onEdgesChange);
  const onConnect = useMapEditorStore((state) => state.onConnect);
  const onEdgesDelete = useMapEditorStore((state) => state.onEdgesDelete);

  const openNoteEditor = useMapEditorStore((state) => state.openNoteEditor);
  const isNoteEditorOpen = useMapEditorStore((state) => state.isNoteEditorOpen);
  const closeNoteEditor = useMapEditorStore((state) => state.closeNoteEditor);
  const selectedNodeId = useMapEditorStore((state) => state.selectedNodeId);
  const updateNodeNote = useMapEditorStore((state) => state.updateNodeNote);
  const toggleIsNodeStudied = useMapEditorStore((state) => state.toggleIsNodeStudied)

  const activeNode = nodes.find((n) => n.id === selectedNodeId);

  useEffect(() => {
    if (currentMapId !== null && (nodes.length > 0 || edges.length > 0)) {
      const dataToSave = JSON.stringify({ nodes, edges });
      localStorage.setItem(`map_data_${currentMapId}`, dataToSave);
    }
  }, [nodes, edges, currentMapId]);

  return (
    <div className="h-full w-full ">
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
        onNodeClick={(_, node) => openNoteEditor(node.id)}
        defaultEdgeOptions={{
          type: "bezier",
        }}
        fitView
        panOnScroll
        onNodeContextMenu={(e, node) => {
          e.preventDefault();
          toggleIsNodeStudied(node.id);
        }}
      >
        <Background />
        <Zoomer />
      </ReactFlow>

      <NoteEditor
        isOpen={isNoteEditorOpen}
        initialTitle={(activeNode?.data?.label as string) || ""}
        initialContent={(activeNode?.data?.noteContent as string) || ""}
        onClose={closeNoteEditor}
        onSave={(data) => {
          if (selectedNodeId) {
            updateNodeNote(selectedNodeId, data.title, data.content);
          }
        }}
      />
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
