import { Node as FlowNode } from "@xyflow/react";

export default interface Map {
  id: number;
  title: string;
  projectId: number;
  description?: string;
  createdAt: Date;
  lastOpened: Date;
  miniMapIcon?: string;
  nodes?: FlowNode[];
}
