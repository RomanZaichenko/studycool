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
  type Node,
  type Edge,
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

  const { setCenter, fitView } = useReactFlow();

  const currentMapId = useMapEditorStore((state) => state.currentMapId);
  const nodes = useMapEditorStore((state) => state.nodes);
  const edges = useMapEditorStore((state) => state.edges);
  const setNodes = useMapEditorStore((state) => state.setNodes);
  const setEdges = useMapEditorStore((state) => state.setEdges);
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

  const undo = useMapEditorStore((state) => state.undo);
  const redo = useMapEditorStore((state) => state.redo);
  const takeSnapshot = useMapEditorStore((state) => state.takeSnapshot);
  const past = useMapEditorStore((state) => state.past);
  const future = useMapEditorStore((state) => state.future);

  const updateMapNodes = useMainStore((state) => state.updateMapNodes);

  const activeNode = nodes.find((n) => n.id === selectedNodeId);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const hasAutoOpened = useRef(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNoteEditorOpen) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();

        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, isNoteEditorOpen]);

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
      if (!isInitialized.current) {
        if (nodes.length > 0 || edges.length > 0) {
          isInitialized.current = true;
        } else {
          return;
        }
      }

      localStorage.setItem(
        `map_data_${currentMapId}`,
        JSON.stringify({ nodes, edges })
      );

      if (updateMapNodes) {
        updateMapNodes(currentMapId, nodes as Node[], edges as Edge[]);
      }
    }
  }, [nodes, edges, currentMapId, updateMapNodes]);

  const handleImport = (data: { nodes: Node[]; edges: Edge[] }) => {
    setNodes(data.nodes);
    setEdges(data.edges);
    isInitialized.current = true;

    setTimeout(() => {
      fitView({ duration: 500, padding: 0.2 });
    }, 50);
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
        onNodeDragStart={() => takeSnapshot()}
        onNodesDelete={() => takeSnapshot()}
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
          <div className="mr-2 flex overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
            <button
              onClick={undo}
              disabled={past.length === 0}
              title="Undo (Ctrl+Z)"
              className="px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-30"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </button>
            <div className="w-px bg-gray-200"></div>
            <button
              onClick={redo}
              disabled={future.length === 0}
              title="Redo (Ctrl+Shift+Z)"
              className="px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-30"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                />
              </svg>
            </button>
          </div>

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

      {selectedNodeId && (
        <NoteEditor
          id={selectedNodeId}
          isOpen={isNoteEditorOpen}
          initialTitle={(activeNode?.data?.label as string) || ""}
          initialContent={(activeNode?.data?.noteContent as string) || ""}
          onClose={closeNoteEditor}
          onSave={(data) =>
            updateNodeNote(selectedNodeId, data.title, data.content)
          }
        />
      )}

      <ExportModal
        isOpen={mapLogic.isOpenExport}
        onClose={() => mapLogic.setIsOpenExport(false)}
        exportType="map"
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}

export default function MapArea() {
  const params = useParams();
  const rawId = params?.id;
  const mapId = Array.isArray(rawId) ? rawId[0] : rawId;
  const loadMapData = useMapEditorStore((state) => state.loadMapData);
  const resetMap = useMapEditorStore((state) => state.resetMap);
  const updateLastOpened = useMainStore((state) => state.updateMapAccessTime);

  useEffect(() => {
    if (!mapId) return;
    updateLastOpened(mapId);

    const fetchAndLoadMap = async () => {
      const savedMapData = localStorage.getItem(`map_data_${mapId}`);
      let fetchedNodes: Node[] = [];
      let fetchedEdges: Edge[] = [];
      let hasLocalData = false;

      if (savedMapData) {
        try {
          const parsedData = JSON.parse(savedMapData);
          if (parsedData.nodes && parsedData.nodes.length > 0) {
            fetchedNodes = parsedData.nodes;
            fetchedEdges = parsedData.edges || [];
            hasLocalData = true;
          }
        } catch (e) {
          console.error("Помилка парсингу локальних даних мапи:", e);
        }
      }

      if (!hasLocalData) {
        try {
          const response = await fetch(`/api/maps/${mapId}`, {
            cache: "no-store",
          });
          if (response.ok) {
            const dbMap = await response.json();
            fetchedNodes = dbMap.nodes || [];
            fetchedEdges = dbMap.edges || [];

            if (fetchedNodes.length > 0 || fetchedEdges.length > 0) {
              localStorage.setItem(
                `map_data_${mapId}`,
                JSON.stringify({ nodes: fetchedNodes, edges: fetchedEdges })
              );
            }
          }
        } catch (e) {
          console.error("Помилка завантаження мапи з бази даних:", e);
        }
      }

      loadMapData(mapId, fetchedNodes, fetchedEdges);
    };

    fetchAndLoadMap();

    return () => resetMap();
  }, [mapId, loadMapData, resetMap, updateLastOpened]);

  return (
    <ReactFlowProvider>
      <MapFlow />
    </ReactFlowProvider>
  );
}
