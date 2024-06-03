import { useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  NodeOrigin,
  Node,
  OnConnectEnd,
  OnConnectStart,
  useReactFlow,
  useStoreApi,
  Controls,
  Panel,
  MiniMap,
  Background,
} from "reactflow";
import { shallow } from "zustand/shallow";
import { nanoid } from "nanoid";

import useStore from "./store";
import MindMapNode from "./MindMapNode";
import MindMapEdge from "./MindMapEdge";
import TextBoxNode from "./nodegroup/Textbox";
import BoundingBoxNode from "./nodegroup/BoundingBox";
import DatabaseNode from "./nodegroup/Database";
import { Button } from "@mui/material";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// we need to import the React Flow styles to make it work
import "reactflow/dist/style.css";

import DownloadButton from "./components/DownloadButton";
import DiagramTypeSwitcher from "./components/DiagramSwitcher";
import BottomToolbar from "./components/BottomToolbar";
import FlowNode from "./nodegroup/FlowNode";

const nodeTypes = {
  mindmap: MindMapNode,
  textbox: TextBoxNode,
  boundingbox: BoundingBoxNode,
  database: DatabaseNode,
  flowmap: FlowNode,
};

const edgeTypes = {
  mindmap: MindMapEdge,
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];

function Flow() {
  const store = useStoreApi();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addChildNode,
    setSelectedNodeId,
    diagramType,
    selectedNodeId,
    deleteNode,
  } = useStore(
    (state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      addChildNode: state.addChildNode,
      diagramType: state.diagramType,
      setDiagramType: state.setDiagramType,
      setSelectedNodeId: state.setSelectedNodeId,
      selectedNodeId: state.selectedNodeId,
      deleteNode: state.deleteNode,
    }),
    shallow
  );
  const { project, setCenter } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);

  useEffect(() => {
    if (diagramType === "mindmap") {
      setSelectedNodeId("mindmap-root");
    } else if (diagramType === "flow") {
      setSelectedNodeId("flow-root");
    }
  }, [diagramType, setSelectedNodeId]);

  const connectionLineStyle = {
    stroke: diagramType === "mindmap" ? "#F6AD55" : "#000000",
    strokeWidth: diagramType === "mindmap" ? 3 : 2,
  };
  const defaultEdgeOptions = { style: connectionLineStyle, type: "mindmap" };

  const getChildNodePosition = (event: MouseEvent, parentNode?: Node) => {
    const { domNode } = store.getState();

    if (
      !domNode ||
      // we need to check if these properites exist, because when a node is not initialized yet,
      // it doesn't have a positionAbsolute nor a width or height
      !parentNode?.positionAbsolute ||
      !parentNode?.width ||
      !parentNode?.height
    ) {
      return;
    }

    const { top, left } = domNode.getBoundingClientRect();

    // we need to remove the wrapper bounds, in order to get the correct mouse position
    const panePosition = project({
      x: event.clientX - left,
      y: event.clientY - top,
    });

    // we are calculating with positionAbsolute here because child nodes are positioned relative to their parent
    return {
      x: panePosition.x - parentNode.positionAbsolute.x + parentNode.width / 2,
      y: panePosition.y - parentNode.positionAbsolute.y + parentNode.height / 2,
    };
  };

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Accept both MouseEvent and TouchEvent
      const { nodeInternals } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        "react-flow__pane"
      );
      const node = (event.target as Element).closest(".react-flow__node");

      if (node) {
        node.querySelector("input")?.focus({ preventScroll: true });
      } else if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(
          event as MouseEvent,
          parentNode
        ); // Cast event as MouseEvent

        if (parentNode && childNodePosition) {
          addChildNode(parentNode, childNodePosition);
        }
      }
    },
    [getChildNodePosition]
  );

  const addEmptyNode = () => {
    const position = { x: Math.random() * 200, y: Math.random() * 150 };
    const newNode = {
      id: nanoid(), // Generates a unique ID
      type: diagramType === "mindmap" ? "mindmap" : "flowmap",
      data: { label: "New Node" },
      position,
      dragHandle: ".dragHandle",
    };

    useStore.setState((prevState) => ({
      nodes: [...prevState.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
    toast("Added new node!");
  };

  const addEmptyTextNode = () => {
    const position = { x: Math.random() * 200, y: Math.random() * 150 };
    const newNode = {
      id: nanoid(), // Generates a unique ID
      type: "textbox",
      data: { label: "New Node" },
      position,
      dragHandle: ".dragHandle",
    };

    useStore.setState((prevState) => ({
      nodes: [...prevState.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
    toast("Added new text box!");
  };

  const addBoundingBoxNode = () => {
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

    useStore.setState((prevState) => ({
      nodes: [...prevState.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
    toast("Added new bounding box!");
  };

  const addDatabaseNode = () => {
    const position = { x: Math.random() * 200, y: Math.random() * 150 };
    const newNode = {
      id: nanoid(), // Generates a unique ID
      type: "database",
      data: { label: "Database Name" },
      position,
      dragHandle: ".dragHandle",
    };

    useStore.setState((prevState) => ({
      nodes: [...prevState.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
    toast("Added new bounding box!");
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete" && selectedNodeId) {
        deleteNode(selectedNodeId);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteNode, selectedNodeId]);

  return (
    <>
      <svg style={{ width: 0, height: 0, position: "absolute" }}>
        <defs>
          <marker
            id="arrow"
            markerWidth="5"
            markerHeight="20"
            refX="4" // Adjust this to control the point where the arrow points meet the target node
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
            viewBox="0 0 10 10"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#333" />
          </marker>
        </defs>
      </svg>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodeOrigin={nodeOrigin}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={connectionLineStyle}
        fitView
      >
        <Controls />
        <Panel position="top-left" className="header">
          <ToastContainer
            position="bottom-right"
            style={{ marginBottom: "20vh", width: "13%", fontSize: "0.7rem" }}
            autoClose={2000}
            hideProgressBar={true}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <DownloadButton />
          <Button
            style={{ marginLeft: "5px" }}
            variant="contained"
            onClick={addEmptyNode}
            title="Add Empty Node"
          >
            Add Node
          </Button>
          <Button
            style={{ marginLeft: "5px" }}
            variant="contained"
            onClick={addEmptyTextNode}
            title="Add Text Box"
          >
            Add Text
          </Button>
          {diagramType === "flow" && (
            <>
              <Button
                style={{ marginLeft: "5px" }}
                variant="contained"
                onClick={addBoundingBoxNode}
                title="Add Bounding Box"
              >
                Add Container
              </Button>
              <Button
                style={{ marginLeft: "5px" }}
                variant="contained"
                onClick={addDatabaseNode}
                title="Add Database Node"
              >
                Add Database
              </Button>
            </>
          )}
        </Panel>
        <BottomToolbar />
        <DiagramTypeSwitcher nodes={nodes} setCenter={setCenter} />
        <Background />
        <MiniMap />
      </ReactFlow>
    </>
  );
}

export default Flow;
