import { 
  applyNodeChanges, Edge, NodeChange, Node, EdgeChange, 
  applyEdgeChanges, addEdge, Connection, 
  useReactFlow, OnConnectStartParams, OnEdgesDelete 
} from "@xyflow/react";
import { useCallback, useRef, useState } from "react";
import MapNode from "../components/MapNode";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  mapNode: MapNode,
};

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
};

const propagateLevelChange = (
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
          level: safeLevel
        }
      };
    }
    return node;
  });

  if (safeLevel >= 3) return updatedNodes;

  const childEdges = edges.filter((edge) => edge.source === rootNodeId);

  childEdges.forEach((edge) => {
    updatedNodes = propagateLevelChange(edge.target, safeLevel + 1, updatedNodes, edges);
  });
  return updatedNodes;
};

export function useMapLogic() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const { screenToFlowPosition, getEdges } = useReactFlow();
  
  const connectionStartRef = useRef<OnConnectStartParams | null>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nodesSnapshot) => 
      applyNodeChanges(changes, nodesSnapshot)), []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) =>
      applyEdgeChanges(changes, edgesSnapshot)), []
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const newEdges = addEdge(params, edges);
      setEdges(newEdges);
      
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      if (sourceNode && targetNode) {
        const sourceLevel = sourceNode.data?.level as number || 1;
        const targetLevel = targetNode.data?.level as number || 1;

        const expectedTargetLevel = sourceLevel + 1;

        if (targetLevel < expectedTargetLevel && expectedTargetLevel <= 3) {
          setNodes((nodesSnapshot) => {
            return propagateLevelChange(targetNode.id, 
              expectedTargetLevel, 
              nodesSnapshot, 
              newEdges);
          });
        }
      }
    }, [nodes, edges]
  );

  const onEdgesDelete: OnEdgesDelete = useCallback((deletedEdges) => {
    const remainingEdges = edges.filter((edge) => 
      !deletedEdges.some((delEdge) => delEdge.id === edge.id));

    setEdges(remainingEdges);
    
    deletedEdges.forEach((deletedEdge) => {
      const targetNodeId = deletedEdge.target;
      const hasOtherParents = remainingEdges.some((edge) => 
        edge.target === targetNodeId);

      if (!hasOtherParents) {
        setNodes((nodesSnapshot) => {
          return propagateLevelChange(targetNodeId, 1, nodesSnapshot, remainingEdges);
        });
      }
    });
  }, [edges]);

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (connection.source === connection.target) return false;

      const currentEdges = getEdges();

      const isDuplicate = currentEdges.some((edge) => {
        const isDirect = edge.source === connection.source &&
          edge.target === connection.target;

        const isReverse = edge.source === connection.target &&
          edge.target === connection.source;

        return isReverse || isDirect;
      });

      return !isDuplicate;
    }, [getEdges]
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const newNode = {
        id: `node-${crypto.randomUUID().slice(0, 8)}`,
        type: 'mapNode',
        position,
        data: { label: "New node", level: 1 },
        origin: [0.5, 0.5] as [number, number]
      };

      setNodes((nodes) => nodes.concat(newNode));
    },
    [screenToFlowPosition]
  );

  const onConnectStart = useCallback((event: MouseEvent | TouchEvent, params: OnConnectStartParams) => {
    connectionStartRef.current = params;
  }, []);

  const onConnectEnd = useCallback((event: MouseEvent | TouchEvent) => {
    const target = event.target as Element;
    const isPane = target.classList.contains('react-flow__pane');
    
    if (isPane && connectionStartRef.current) {
      const currentConnection = connectionStartRef.current;
      connectionStartRef.current = null; 

      const { clientX, clientY } = 'changedTouches' in event ? 
        event.changedTouches[0] : event;

      const position = screenToFlowPosition({
        x: clientX,
        y: clientY
      });

      const { nodeId, handleType, handleId } = currentConnection;

      const newNodeId = `node-${crypto.randomUUID().slice(0, 8)}`;
      const endHandleId = idTranslate[handleId as string];

      const newEdge: Edge = {
        id: `e-${newNodeId}-${nodeId}`,
        source: handleType === 'source' ? nodeId! : newNodeId,
        target: handleType === 'source' ? newNodeId : nodeId!,
        sourceHandle: handleType === 'source' ? handleId : endHandleId,
        targetHandle: handleType === 'target' ? handleId : endHandleId,
        type: 'bezier'
      };

      setEdges((edges) => edges.concat(newEdge));

      setNodes((prevNodes) => {
        const sourceNode = prevNodes.find((node) => node.id === nodeId);
        const sourceLevel = sourceNode?.data?.level as number || 1;
        const newLevel = Math.min(sourceLevel + 1, 3);

        const newNode: Node = {
          id: newNodeId,
          type: "mapNode",
          position,
          data: { label: "New Node", level: newLevel },
          origin: [0.5, 0.5] as [number, number]
        };

        return prevNodes.concat(newNode);
      });
    }
  }, [screenToFlowPosition]); 

  return {
    nodes, edges, nodeTypes, onNodesChange, onEdgesChange, onConnect,
    onEdgesDelete,
    onPaneContextMenu, isValidConnection, onConnectEnd, onConnectStart
  };
}