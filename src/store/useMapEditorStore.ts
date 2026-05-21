import { create } from "zustand";
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  OnEdgesDelete,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  XYPosition,
} from "@xyflow/react";

export const propagateLevelChange = (
  rootNodeId: string,
  newLevel: number,
  nodes: Node[],
  edges: Edge[]
): Node[] => {
  const safeLevel = Math.min(newLevel, 3);
  let updatedNodes = nodes.map((node) => {
    if (node.id === rootNodeId) {
      if (node.data?.level === safeLevel) return node;
      return { ...node, data: { ...node.data, level: safeLevel } };
    }
    return node;
  });
  if (safeLevel >= 3) return updatedNodes;
  edges
    .filter((e) => e.source === rootNodeId)
    .forEach((e) => {
      updatedNodes = propagateLevelChange(
        e.target,
        safeLevel + 1,
        updatedNodes,
        edges
      );
    });
  return updatedNodes;
};

type HistoryState = { nodes: Node[]; edges: Edge[] };

interface MapEditorState {
  nodes: Node[];
  edges: Edge[];
  currentMapId: number | null;
  isNoteEditorOpen: boolean;
  selectedNodeId: string | null;

  past: HistoryState[];
  future: HistoryState[];
  takeSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection | Edge) => void;
  onEdgesDelete: OnEdgesDelete;
  openNoteEditor: (nodeId: string) => void;
  closeNoteEditor: () => void;
  updateNodeNote: (nodeId: string, title: string, content: string) => void;
  toggleIsNodeStudied: (nodeId: string) => void;
  addNodeAtPosition: (position: XYPosition) => void;
  createNodeFromConnection: (
    position: XYPosition,
    nodeId: string,
    handleType: string,
    handleId: string,
    endHandleId: string
  ) => void;
  loadMapData: (mapId: number, nodes: Node[], edges: Edge[]) => void;
  resetMap: () => void;
}

export const useMapEditorStore = create<MapEditorState>((set, get) => ({
  nodes: [],
  edges: [],
  currentMapId: null,
  isNoteEditorOpen: false,
  selectedNodeId: null,
  past: [],
  future: [],

  takeSnapshot: () => {
    const { nodes, edges, past } = get();
    const newPast = [...past, { nodes, edges }].slice(-50);
    set({ past: newPast, future: [] });
  },

  undo: () => {
    const { past, future, nodes, edges } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [{ nodes, edges }, ...future],
      nodes: previous.nodes,
      edges: previous.edges,
    });
  },

  redo: () => {
    const { past, future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      past: [...past, { nodes, edges }],
      future: future.slice(1),
      nodes: next.nodes,
      edges: next.edges,
    });
  },

  setNodes: (nodes) => {
    get().takeSnapshot();
    set({ nodes });
  },
  setEdges: (edges) => {
    get().takeSnapshot();
    set({ edges });
  },

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),
  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (params) => {
    get().takeSnapshot();
    const { nodes, edges } = get();
    const newEdges = addEdge(params, edges);
    set({ edges: newEdges });
    const sourceNode = nodes.find((n) => n.id === params.source);
    const targetNode = nodes.find((n) => n.id === params.target);
    if (sourceNode && targetNode) {
      const expected = ((sourceNode.data?.level as number) || 1) + 1;
      set({
        nodes: propagateLevelChange(targetNode.id, expected, nodes, newEdges),
      });
    }
  },

  onEdgesDelete: (deletedEdges) => {
    get().takeSnapshot();
    const { nodes, edges } = get();
    const remaining = edges.filter(
      (e) => !deletedEdges.some((de) => de.id === e.id)
    );
    set({ edges: remaining });
    let current = [...nodes];
    deletedEdges.forEach((de) => {
      if (!remaining.some((e) => e.target === de.target)) {
        current = propagateLevelChange(de.target, 1, current, remaining);
      }
    });
    set({ nodes: current });
  },

  openNoteEditor: (id) => set({ selectedNodeId: id, isNoteEditorOpen: true }),
  closeNoteEditor: () => set({ selectedNodeId: null, isNoteEditorOpen: false }),

  updateNodeNote: (id, title, content) => {
    get().takeSnapshot();
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, label: title, noteContent: content } }
          : n
      ),
    }));
  },

  toggleIsNodeStudied: (id) => {
    get().takeSnapshot();
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, isStudied: !n.data.isStudied } }
          : n
      ),
    }));
  },

  addNodeAtPosition: (pos) => {
    get().takeSnapshot();
    set((s) => ({
      nodes: [
        ...s.nodes,
        {
          id: `node-${crypto.randomUUID().slice(0, 8)}`,
          type: "mapNode",
          position: pos,
          data: { label: "New node", level: 1 },
          origin: [0.5, 0.5],
        },
      ],
    }));
  },

  createNodeFromConnection: (
    pos,
    nodeId,
    handleType,
    handleId,
    endHandleId
  ) => {
    get().takeSnapshot();
    const { nodes, edges } = get();
    const newNodeId = `node-${crypto.randomUUID().slice(0, 8)}`;
    const newEdge = {
      id: `e-${newNodeId}-${nodeId}`,
      source: handleType === "source" ? nodeId : newNodeId,
      target: handleType === "source" ? newNodeId : nodeId,
      sourceHandle: handleType === "source" ? handleId : endHandleId,
      targetHandle: handleType === "target" ? handleId : endHandleId,
      type: "bezier",
    };
    const src = nodes.find((n) => n.id === nodeId);
    const newLevel = Math.min(((src?.data?.level as number) || 1) + 1, 3);
    set({
      nodes: [
        ...nodes,
        {
          id: newNodeId,
          type: "mapNode",
          position: pos,
          data: { label: "New Node", level: newLevel },
          origin: [0.5, 0.5],
        },
      ],
      edges: [...edges, newEdge],
    });
  },

  loadMapData: (id, n, e) =>
    set({ currentMapId: id, nodes: n, edges: e, past: [], future: [] }),
  resetMap: () =>
    set({ currentMapId: null, nodes: [], edges: [], past: [], future: [] }),
}));
