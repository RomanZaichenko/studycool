import { Node as FlowNode } from "@xyflow/react";

export default interface Map {
  id: string;
  title: string;
  projectId: string;
  description?: string;
  createdAt: Date;
  lastOpened: Date;
  miniMapIcon?: string;
  nodes?: FlowNode[];
}
