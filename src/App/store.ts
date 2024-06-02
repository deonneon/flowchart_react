import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition,
  Position,
} from "reactflow";
import { createWithEqualityFn } from "zustand/traditional";
import { nanoid } from "nanoid/non-secure";
import { toast } from "react-toastify";

import { NodeData } from "./MindMapNode";

export type DiagramType = "mindmap" | "flow";

const mindmapRootNode = {
  id: "mindmap-root",
  type: "mindmap",
  data: { label: "Enter Topic to Start (Mindmap)" },
  position: { x: 0, y: 0 },
  dragHandle: ".dragHandle",
};

const flowRootNode = {
  id: "flow-root",
  type: "flowmap",
  data: { label: "Enter Topic to Start (Flow)" },
  position: { x: 0, y: 0 },
  dragHandle: ".dragHandle",
};

export type RFState = {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  updateNodeLabel: (nodeId: string, label: string) => void;
  addChildNode: (parentNode: Node, position: XYPosition) => void;
  edgePathType: "smooth" | "straight" | "bezier";
  diagramType: DiagramType;
  setDiagramType: (diagramType: DiagramType) => void;
  deleteNode: (id: string) => void;
  updateNodeColor: (nodeId: string, color: string) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (nodeId: string | null) => void;
  updateBoundingBoxStyle: (nodeId: string, borderStyle: string) => void;
  updateBoundingBoxRadius: (nodeId: string, borderRadius: string) => void;
};

const useStore = createWithEqualityFn<RFState>((set, get) => ({
  diagramType: "flow",
  setDiagramType: (type) => {
    const nodes = type === "mindmap" ? [mindmapRootNode] : [flowRootNode];
    set({ diagramType: type, nodes, edges: [] });
  },

  updateBoundingBoxStyle: (nodeId, borderStyle: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId && node.type === "boundingbox") {
          node.style = { ...node.style, border: borderStyle };
        }
        return node;
      }),
    });
  },
  updateBoundingBoxRadius: (nodeId: string, borderRadius: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId && node.type === "boundingbox") {
          node.style = { ...node.style, borderRadius };
        }
        return node;
      }),
    });
  },

  deleteNode: (id) => {
    set((state) => {
      const nodeToDelete = state.nodes.find((node) => node.id === id);
      if (!nodeToDelete) {
        toast.error("Node not found!", { position: "top-center" });
        return {}; // Node ID not found
      }

      // Check if the node has any child nodes
      const childNodes = state.nodes.filter((node) => node.parentNode === id);
      if (childNodes.length > 0) {
        toast.error("Cannot delete a node with children!", {
          position: "top-center",
        });
        return {}; // Prevent deletion if there are child nodes
      }

      // Check if the node is a critical connector
      const connectedEdges = state.edges.filter(
        (edge) => edge.source === id || edge.target === id
      );
      if (connectedEdges.length > 2) {
        toast.error("Node is a critical connector!", {
          position: "top-center",
        });
        return {}; // Prevent deletion if it's a critical connector
      }

      // Proceed with deletion
      return {
        nodes: state.nodes.filter((node) => node.id !== id),
        edges: state.edges.filter(
          (edge) => edge.source !== id && edge.target !== id
        ),
      };
    });
  },
  selectedNodeId: "flow-root",
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  nodes: [flowRootNode],
  edges: [],
  edgePathType: "straight",
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  updateNodeLabel: (nodeId: string, label: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // it's important to create a new object here, to inform React Flow about the changes
          node.data = { ...node.data, label };
        }

        return node;
      }),
    });
  },
  addChildNode: (parentNode: Node, position: XYPosition) => {
    const newNode = {
      id: nanoid(),
      type: get().diagramType === "mindmap" ? "mindmap" : "flowmap",
      data: {
        label: "New Node",
        sourcePosition: Position.Left,
      },
      position,
      dragHandle: ".dragHandle",
      parentNode: parentNode.id,
    };

    const newEdge = {
      id: nanoid(),
      source: parentNode.id,
      target: newNode.id,
    };

    set({
      nodes: [...get().nodes, newNode],
      edges: [...get().edges, newEdge],
      selectedNodeId: newNode.id,
    });
  },
  updateNodeColor: (nodeId: string, color: string) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, color };
        }
        return node;
      }),
    });
  },
}));

export default useStore;
