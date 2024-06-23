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
import { produce } from "immer";

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
  showShadowNodes: boolean;
  toggleShowShadowNodes: () => void;
  addChildNode: (parentNode: Node, position: XYPosition) => string;
  addShadowNode: (parentId: string, position: XYPosition) => void;
  convertShadowNode: (shadowNodeId: string) => void;
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
  deleteEdge: (id: string) => void;
  toggleEdgeStyle: (id: string) => void;
  addEmptyNode: () => void;
  addEmptyTextNode: () => void;
  addBoundingBoxNode: () => void;
  addDatabaseNode: () => void;
  addPeopleNode: () => void;
  past: Array<{ nodes: Node<NodeData>[]; edges: Edge[] }>;
  future: Array<{ nodes: Node<NodeData>[]; edges: Edge[] }>;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  saveCurrentState: () => void;
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
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId && node.type === "boundingbox") {
          return {
            ...node,
            style: { ...node.style, border: borderStyle },
          };
        }
        return node;
      }),
    }));
    get().saveCurrentState();
  },
  updateBoundingBoxRadius: (nodeId: string, borderRadius: string) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId && node.type === "boundingbox") {
          return {
            ...node,
            style: { ...node.style, borderRadius },
          };
        }
        return node;
      }),
    }));
    get().saveCurrentState();
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
    get().saveCurrentState();
  },
  selectedNodeId: "flow-root",
  setSelectedNodeId: (nodeId) => set({ selectedNodeId: nodeId }),
  nodes: [flowRootNode],
  edges: [],
  edgePathType: "straight",
  onNodesChange: (changes: NodeChange[]) => {
    set(
      produce((state: RFState) => {
        state.nodes = applyNodeChanges(changes, state.nodes);
      })
    );
    get().saveCurrentState();
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set(
      produce((state: RFState) => {
        state.edges = applyEdgeChanges(changes, state.edges);
      })
    );
    get().saveCurrentState();
  },
  updateNodeLabel: (nodeId: string, label: string) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, label },
          };
        }
        return node;
      }),
    }));
    get().saveCurrentState();
  },
  addChildNode: (parentNode: Node, position: XYPosition) => {
    const newNodeId = nanoid();
    const newNode = {
      id: newNodeId,
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
      target: newNodeId,
    };
    set((state) => ({
      nodes: [...state.nodes, newNode],
      edges: [...state.edges, newEdge],
      selectedNodeId: newNodeId,
    }));
    return newNodeId;
  },
  addShadowNode: (parentId: string, position: XYPosition) => {
    const shadowNodeId = `shadow-${nanoid()}`;
    const shadowNode: Node<NodeData> = {
      id: shadowNodeId,
      type: "shadow",
      data: { label: "New Node" },
      position,
      parentNode: parentId,
    };
    const shadowEdge: Edge = {
      id: `shadow-edge-${nanoid()}`,
      source: parentId,
      target: shadowNodeId,
      style: { stroke: "#ccc", strokeDasharray: "5,5" },
    };
    set((state) => ({
      nodes: [...state.nodes, shadowNode],
      edges: [...state.edges, shadowEdge],
    }));
  },
  convertShadowNode: (shadowNodeId: string) => {
    set((state) => {
      const shadowNode = state.nodes.find((node) => node.id === shadowNodeId);
      if (!shadowNode) return state;
      const newNodeId = nanoid();
      const newNode: Node<NodeData> = {
        ...shadowNode,
        id: newNodeId,
        type: state.diagramType === "mindmap" ? "mindmap" : "flowmap",
        data: { ...shadowNode.data, label: "New Node" },
      };
      const newEdge: Edge = {
        id: nanoid(),
        source: shadowNode.parentNode!,
        target: newNodeId,
      };
      return {
        nodes: [
          ...state.nodes.filter((node) => node.id !== shadowNodeId),
          newNode,
        ],
        edges: [
          ...state.edges.filter((edge) => edge.target !== shadowNodeId),
          newEdge,
        ],
        selectedNodeId: newNodeId,
      };
    });
    get().saveCurrentState();
  },
  updateNodeColor: (nodeId: string, color: string) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, color },
          };
        }
        return node;
      }),
    }));
    get().saveCurrentState();
  },
  showShadowNodes: false,
  toggleShowShadowNodes: () => {
    set((state) => ({
      showShadowNodes: !state.showShadowNodes,
    }));
  },
  copiedNodeId: null,
  cloneNode: () => {
    const { copiedNodeId, nodes, diagramType } = get();
    const nodeToClone = nodes.find((node) => node.id === copiedNodeId);
    if (nodeToClone) {
      const newNode = {
        id: nanoid(),
        type: nodeToClone.type,
        data: { label: `Clone of ${nodeToClone.data.label}` }, // Create a new data object
        position: {
          x: nodeToClone.position.x + 1,
          y: nodeToClone.position.y + 1,
        },
        dragHandle: ".dragHandle",
      };
      set({
        nodes: [...nodes, newNode],
        selectedNodeId: newNode.id,
      });
      toast("Node cloned!");
    } else {
      toast.error("No node selected to clone!");
    }
  },
  deleteEdge: (id: string) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
    get().saveCurrentState();
  },
  toggleEdgeStyle: (id: string) => {
    set((state) => ({
      edges: state.edges.map((edge) => {
        if (edge.id === id) {
          // Create a new object to ensure it's extensible
          const updatedEdge = { ...edge, style: { ...edge.style } };
          if (updatedEdge.style.strokeDasharray) {
            delete updatedEdge.style.strokeDasharray;
          } else {
            updatedEdge.style.strokeDasharray = "5,5";
          }
          return updatedEdge;
        }
        return edge;
      }),
    }));
    get().saveCurrentState();
  },
  addEmptyNode: () => {
    const { diagramType, setSelectedNodeId } = get();
    const position = { x: Math.random() * 200, y: Math.random() * 150 };
    const newNode = {
      id: nanoid(), // Generates a unique ID
      type: diagramType === "mindmap" ? "mindmap" : "flowmap",
      data: { label: "New Node" },
      position,
      dragHandle: ".dragHandle",
    };
    set((prevState) => ({
      nodes: [...prevState.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
    toast("Added new node!");
  },
  addEmptyTextNode: () => {
    const { setSelectedNodeId } = get();
    const position = { x: Math.random() * 200, y: Math.random() * 150 };
    const newNode = {
      id: nanoid(), // Generates a unique ID
      type: "textbox",
      data: { label: "New Node" },
      position,
      dragHandle: ".dragHandle",
    };
    set((prevState) => ({
      nodes: [...prevState.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
    toast("Added new text box!");
  },
  addBoundingBoxNode: () => {
    const { setSelectedNodeId } = get();
    const position = { x: Math.random() * 200, y: Math.random() * 150 };
    const newNode = {
      id: nanoid(), // Generates a unique ID
      type: "boundingbox",
      data: { label: "Header" },
      position,
      dragHandle: ".dragHandle",
      style: {
        border: "1px solid black",
      },
    };
    set((prevState) => ({
      nodes: [...prevState.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
    toast("Added new bounding box!");
  },
  addDatabaseNode: () => {
    const { setSelectedNodeId } = get();
    const position = { x: Math.random() * 200, y: Math.random() * 150 };
    const newNode = {
      id: nanoid(), // Generates a unique ID
      type: "database",
      data: { label: "Database Name" },
      position,
      dragHandle: ".dragHandle",
    };
    set((prevState) => ({
      nodes: [...prevState.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
    toast("Added new bounding box!");
  },
  addPeopleNode: () => {
    const { setSelectedNodeId } = get();
    const position = { x: Math.random() * 200, y: Math.random() * 150 };
    const newNode = {
      id: nanoid(), // Generates a unique ID
      type: "people",
      data: { label: "Person" },
      position,
      dragHandle: ".dragHandle",
    };
    set((prevState) => ({
      nodes: [...prevState.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
    toast("Added new person node!");
  },
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,
  saveCurrentState: () => {
    const { nodes, edges, past } = get();
    const currentState = { nodes: deepCopy(nodes), edges: deepCopy(edges) };

    // Prevent saving the same state consecutively
    if (past.length > 0) {
      const lastState = past[past.length - 1];
      if (JSON.stringify(lastState) === JSON.stringify(currentState)) {
        return;
      }
    }

    const newPast = past.length > 50 ? past.slice(1) : past;
    set({
      past: [...newPast, currentState],
      future: [],
      canUndo: true,
      canRedo: false,
    });

    console.log("saveCurrentState activated");
  },
  undo: () => {
    const { past, nodes, edges, future } = get();
    if (past.length === 0) return;

    const previousState = past[past.length - 1];
    const newPast = past.slice(0, -1);

    set({
      nodes: deepCopy(previousState.nodes),
      edges: deepCopy(previousState.edges),
      past: newPast,
      future: [{ nodes: deepCopy(nodes), edges: deepCopy(edges) }, ...future],
      canUndo: newPast.length > 0,
      canRedo: true,
    });
  },
  redo: () => {
    const { future, nodes, edges } = get();
    if (future.length === 0) return;

    const nextState = future[0];
    set({
      nodes: nextState.nodes,
      edges: nextState.edges,
      past: [...get().past, { nodes: deepCopy(nodes), edges: deepCopy(edges) }],
      future: future.slice(1),
      canUndo: true,
      canRedo: future.length > 1,
    });
  },
}));

// Helper function for deep copying
function deepCopy(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export default useStore;
