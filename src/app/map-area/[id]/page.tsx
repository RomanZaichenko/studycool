"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  ReactFlow,
  Background,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
} from "@xyflow/react";

import Zoomer from "../components/Zoomer";
import NoteEditor from "@/app/map-area/components/NoteEditor";
import { ExportModal } from "../components/ExportModal";
import { ImportModal } from "../components/ImportModal";
import { MapToolbar } from "../components/MapToolbar";

import { useMapLogic } from "../hooks/useMapLogic";
import { useLoadMapData } from "../hooks/useLoadMapData";
import { useAutoSaveMap } from "../hooks/useAutoSaveMap";
import { useAutoOpenNode } from "../hooks/useAutoOpenNode";
import { useUndoRedoHotkeys } from "../hooks/useUndoRedoHotkeys";
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

  useUndoRedoHotkeys(undo, redo, isNoteEditorOpen);
  useAutoOpenNode(openNodeId, nodes, openNoteEditor, setCenter);
  useAutoSaveMap(currentMapId, nodes, edges, updateMapNodes);

  const handleImport = (data: { nodes: Node[]; edges: Edge[] }) => {
    setNodes(data.nodes);
    setEdges(data.edges);

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

        <MapToolbar
          undo={undo}
          redo={redo}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          onImportClick={() => setIsImportModalOpen(true)}
          onExportClick={() => mapLogic.setIsOpenExport(true)}
        />
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

  useLoadMapData(mapId);

  return (
    <ReactFlowProvider>
      <MapFlow />
    </ReactFlowProvider>
  );
}
