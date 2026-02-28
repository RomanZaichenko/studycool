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
      return {
        ...node,
        data: {
          ...node.data,
          level: safeLevel,
        },
      };
    }
    return node;
  });

  if (safeLevel >= 3) return updatedNodes;

  const childEdges = edges.filter((edge) => edge.source === rootNodeId);

  childEdges.forEach((edge) => {
    updatedNodes = propagateLevelChange(
      edge.target,
      safeLevel + 1,
      updatedNodes,
      edges
    );
  });
  return updatedNodes;
};

interface MapEditorState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection | Edge) => void;
  onEdgesDelete: OnEdgesDelete;

  addNodeAtPosition: (position: XYPosition) => void;
  createNodeFromConnection: (
    position: XYPosition,
    nodeId: string,
    handleType: string,
    handleId: string,
    endHandleId: string
  ) => void;
}

export const useMapEditorStore = create<MapEditorState>((set, get) => ({
  nodes: [],
  edges: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (params) => {
    const { nodes, edges } = get();
    const newEdges = addEdge(params, edges);
    set({ edges: newEdges });
    
    const sourceNode = nodes.find((node) => node.id === params.source);
    const targetNode = nodes.find((node) => node.id === params.target);

    if (sourceNode && targetNode) {
      const sourceLevel = (sourceNode.data?.level as number) || 1;
      const targetLevel = (targetNode.data?.level as number) || 1;
      const expectedTargetLevel = sourceLevel + 1;

      if (targetLevel < expectedTargetLevel && expectedTargetLevel <= 3) {
        set({
          nodes: propagateLevelChange(targetNode.id, expectedTargetLevel, nodes, newEdges)
        });
      }
    }
  },

  onEdgesDelete: (deletedEdges) => {
    const { nodes, edges } = get();
    const remainingEdges = edges.filter(
      (edge) => !deletedEdges.some((delEdge) => delEdge.id === edge.id)
    );

    set({ edges: remainingEdges });
    
    let currentNodes = [...nodes];
    deletedEdges.forEach((deletedEdge) => {
      const targetNodeId = deletedEdge.target;
      const hasOtherParents = remainingEdges.some((edge) => edge.target === targetNodeId);

      if (!hasOtherParents) {
        currentNodes = propagateLevelChange(targetNodeId, 1, currentNodes, remainingEdges);
      }
    });
    set({ nodes: currentNodes });
  },

  addNodeAtPosition: (position) => {
    const newNode: Node = {
      id: `node-${crypto.randomUUID().slice(0, 8)}`,
      type: 'mapNode',
      position,
      data: { label: "New node", level: 1 },
      origin: [0.5, 0.5] as [number, number]
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  createNodeFromConnection: (position, nodeId, handleType, handleId, endHandleId) => {
    const { nodes, edges } = get();
    const newNodeId = `node-${crypto.randomUUID().slice(0, 8)}`;

    const newEdge: Edge = {
      id: `e-${newNodeId}-${nodeId}`,
      source: handleType === 'source' ? nodeId : newNodeId,
      target: handleType === 'source' ? newNodeId : nodeId,
      sourceHandle: handleType === 'source' ? handleId : endHandleId,
      targetHandle: handleType === 'target' ? handleId : endHandleId,
      type: 'bezier'
    };

    const sourceNode = nodes.find((node) => node.id === nodeId);
    const sourceLevel = (sourceNode?.data?.level as number) || 1;
    const newLevel = Math.min(sourceLevel + 1, 3);

    const newNode: Node = {
      id: newNodeId,
      type: "mapNode",
      position,
      data: { label: "New Node", level: newLevel },
      origin: [0.5, 0.5] as [number, number]
    };

    set({ 
      nodes: [...nodes, newNode], 
      edges: [...edges, newEdge] 
    });
  }
}));
