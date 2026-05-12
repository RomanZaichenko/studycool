"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  ConnectionMode,
  ReactFlowProvider,
  Panel,
  useReactFlow,
  Node,
  Edge,
} from "@xyflow/react";

import Zoomer from "../components/Zoomer";
import NoteEditor from "@/app/map-area/components/NoteEditor";
import { ExportModal } from "../components/ExportModal";
import { ImportModal } from "../components/ImportModal";

import { useMapLogic } from "../hooks/useMapLogic";
import { useMapEditorStore } from "@/store/useMapEditorStore";
import { useMainStore } from "@/store/useMainStore";

function MapFlow() {
  const mapLogic = useMapLogic();

  const searchParams = useSearchParams();
  const openNodeId = searchParams.get("openNode");

  const { setCenter } = useReactFlow();

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
  const toggleIsNodeStudied = useMapEditorStore(
    (state) => state.toggleIsNodeStudied
  );

  const updateMapNodes = useMainStore((state) => state.updateMapNodes);

  const activeNode = nodes.find((n) => n.id === selectedNodeId);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (openNodeId && nodes.length > 0 && !hasAutoOpened.current) {
      const targetNode = nodes.find((n) => n.id === openNodeId);

      if (targetNode) {
        openNoteEditor(openNodeId);

        setCenter(targetNode.position.x, targetNode.position.y, {
          zoom: 1.5,
          duration: 800,
        });

        hasAutoOpened.current = true;
      }
    }
  }, [openNodeId, nodes, openNoteEditor, setCenter]);

  useEffect(() => {
    if (currentMapId !== null) {
      const dataToSave = JSON.stringify({ nodes, edges });
      localStorage.setItem(`map_data_${currentMapId}`, dataToSave);

      if (updateMapNodes) {
        updateMapNodes(currentMapId, nodes as Node[]);
      }
    }
  }, [nodes, edges, currentMapId, updateMapNodes]);

  const handleImportText = (text: string) => {
    console.log("Отримано текст для імпорту:", text);
  };

  return (
    <div className="h-full w-full">
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
        defaultEdgeOptions={{ type: "bezier" }}
        fitView
        panOnScroll
        onNodeContextMenu={(e, node) => {
          e.preventDefault();
          toggleIsNodeStudied(node.id);
        }}
      >
        <Background />
        <Zoomer />

        <Panel position="top-right" className="flex gap-3 p-4">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="rounded-sm bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            Import
          </button>

          <button
            onClick={() => mapLogic.setIsOpenExport(true)}
            className="rounded-sm bg-gray-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-gray-700"
          >
            Export
          </button>
        </Panel>
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

      <ExportModal
        isOpen={mapLogic.isOpenExport}
        onClose={() => mapLogic.setIsOpenExport(false)}
        exportType="map"
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportText}
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
      try {
        const parsedData = JSON.parse(savedMapData);
        fetchedNodes = parsedData.nodes || [];
        fetchedEdges = parsedData.edges || [];
      } catch (e) {
        console.error("Помилка парсингу даних мапи", e);
      }
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
