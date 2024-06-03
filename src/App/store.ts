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
  data: { label: "Enter Topic to Start" },
  position: { x: 0, y: 0 },
  dragHandle: ".dragHandle",
};

const flowRootNode = {
  id: "flow-root",
  type: "flowmap",
  data: { label: "Enter Starting Topic" },
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
  addEdge: (sourceId: string, targetId: string) => void;
  cloneNode: () => void;
  copiedNodeId: string | null;
};

const useStore = createWithEqualityFn<RFState>((set, get) => ({
  diagramType: "flow",
  setDiagramType: (type) => {
    const nodes = type === "mindmap" ? [mindmapRootNode] : [flowRootNode];
    set({ diagramType: type, nodes, edges: [] });
  },

  addEdge: (sourceId: string, targetId: string) => {
    const newEdge = {
      id: nanoid(),
      source: sourceId,
      target: targetId,
      type: get().diagramType === "mindmap" ? "mindmap" : "flowmap",
      style:
        get().diagramType === "mindmap"
          ? { stroke: "#F6AD55", strokeWidth: 3 }
          : { stroke: "#000000", strokeWidth: 2 },
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));
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
        sourcePosition: Position.Bottom,
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
  copiedNodeId: null,
  cloneNode: () => {
    const { copiedNodeId, nodes, edges, diagramType } = get();
    const nodeToClone = nodes.find((node) => node.id === copiedNodeId);
    if (nodeToClone) {
      const newNode = {
        ...nodeToClone,
        id: nanoid(),
        position: {
          x: nodeToClone.position.x + 50,
          y: nodeToClone.position.y + 50,
        },
      };

      const newEdges = edges
        .filter(
          (edge) => edge.source === copiedNodeId || edge.target === copiedNodeId
        )
        .map((edge) => ({
          ...edge,
          id: nanoid(),
          source: edge.source === copiedNodeId ? newNode.id : edge.source,
          target: edge.target === copiedNodeId ? newNode.id : edge.target,
        }));

      set({
        nodes: [...nodes, newNode],
        edges: [...edges, ...newEdges],
        selectedNodeId: newNode.id,
      });
      toast("Node cloned!");
    } else {
      toast.error("No node selected to clone!");
    }
  },
}));

export default useStore;
