import { useCallback, useRef, useEffect, useState } from "react";
import ReactFlow, {
  ConnectionLineType,
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
import shallow from "zustand/shallow";
import { nanoid } from "nanoid";

import useStore, { RFState } from "./store";
import MindMapNode from "./MindMapNode";
import MindMapEdge from "./MindMapEdge";
import { Button } from "@mui/material";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// we need to import the React Flow styles to make it work
import "reactflow/dist/style.css";

import DownloadButton from "./components/DownloadButton";

import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import GestureIcon from "@mui/icons-material/Gesture";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";

import ColorPalette from "./components/ColorPalette";

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  addChildNode: state.addChildNode,
});

const nodeTypes = {
  mindmap: MindMapNode,
};

const edgeTypes = {
  mindmap: MindMapEdge,
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];

const connectionLineStyle = { stroke: "#F6AD55", strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: "mindmap" };

function Flow() {
  const store = useStoreApi();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addChildNode,
    setDiagramType,
    diagramType,
    setSelectedNodeId,
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
    }),
    shallow
  );
  const { project } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);

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

  const saveToJson = useCallback(() => {
    const { nodes, edges } = useStore.getState();
    const dataToSave = { nodes, edges };
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mindmap.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const handleUploadJson = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text === "string") {
          const { nodes, edges } = JSON.parse(text);
          useStore.setState({ nodes, edges });
        }
      };
      reader.readAsText(file);
    }
  };

  const saveToLocal = useCallback(() => {
    const { nodes, edges } = useStore.getState();
    localStorage.setItem("reactFlowState", JSON.stringify({ nodes, edges }));
    toast("Saved current state!");
  }, []);

  const loadFromLocal = useCallback(() => {
    const data = localStorage.getItem("reactFlowState");
    if (data) {
      const { nodes, edges } = JSON.parse(data);
      useStore.setState({ nodes, edges });
      toast("Restored last saved state!");
    }
  }, []);

  const addEmptyNode = () => {
    const position = { x: Math.random() * 200, y: Math.random() * 150 };
    const newNode = {
      id: nanoid(), // Generates a unique ID
      type: "mindmap", // Assuming 'mindmap' is the type you use for new nodes
      data: { label: "New Node" },
      position,
      dragHandle: ".dragHandle",
    };

    // Adding the new node to the state
    useStore.setState((prevState) => ({
      nodes: [...prevState.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
    toast("Added new node!");
  };

  const activeStyle = {
    backgroundColor: "#4CAF50",
    color: "white",
  };

  const inactiveStyle = {
    marginRight: "5px",
    padding: "10px",
  };

  const { edgePathType } = useStore();

  return (
    <>
      <svg style={{ width: 0, height: 0, position: "absolute" }}>
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="20"
            refX="20" // Adjust this to control the point where the arrow points meet the target node
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
        </Panel>
        <div
          className="toolbar"
          style={{
            position: "absolute",
            bottom: 10,
            left: 50,
            zIndex: 100,
            display: "flex",
            gap: "10px",
            borderRadius: "3px",
          }}
        >
          <button onClick={saveToJson} title="Download as JSON">
            <DownloadIcon />
          </button>
          <button
            style={{
              cursor: "pointer",
              border: "1px solid gray",
              backgroundColor: "rgb(239, 239, 239)",
              padding: "1px 9px",
              borderRadius: "3px",
            }}
            title="Load JSON"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <UploadFileIcon />
          </button>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleUploadJson}
            accept=".json"
          />
          <button onClick={saveToLocal} title="Save Mind Map">
            Save
          </button>
          <button onClick={loadFromLocal} title="Restore">
            Restore
          </button>
          <div
            style={{
              border: "1px solid gray",
              padding: "7px",
              backgroundColor: "rgb(239, 239, 239)",
              display: "flex",
              alignItems: "center",
              borderRadius: "3px",
            }}
          >
            <span style={{ marginRight: "5px" }}>Line Shape </span>
            <button
              style={
                edgePathType === "straight"
                  ? { ...inactiveStyle, ...activeStyle }
                  : inactiveStyle
              }
              onClick={() => useStore.setState({ edgePathType: "straight" })}
            >
              <HorizontalRuleIcon />
            </button>
            <button
              style={
                edgePathType === "bezier"
                  ? { ...inactiveStyle, ...activeStyle }
                  : inactiveStyle
              }
              onClick={() => useStore.setState({ edgePathType: "bezier" })}
            >
              <GestureIcon />
            </button>
            <button
              style={
                edgePathType === "smooth"
                  ? { ...inactiveStyle, ...activeStyle }
                  : inactiveStyle
              }
              onClick={() => useStore.setState({ edgePathType: "smooth" })}
            >
              <ShowChartIcon />
            </button>
          </div>
          <ColorPalette />
        </div>
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 999,
          }}
        >
          <div>
            <button
              style={{
                backgroundColor:
                  diagramType === "mindmap" ? "#FFA500" : "lightgray",
                color: "white",
                border: "0px",
                padding: "10px 20px",
                borderRight: "none",
                cursor: "pointer",
              }}
              onClick={() => setDiagramType("mindmap")}
            >
              Mind Map
            </button>
            <button
              style={{
                backgroundColor:
                  diagramType === "flow" ? "#FFA500" : "lightgray",
                color: "white",
                padding: "10px 20px",
                border: "0px",
                cursor: "pointer",
              }}
              onClick={() => setDiagramType("flow")}
            >
              Flow Diagram
            </button>
          </div>
          <div
            style={{
              color: "gray",
              textAlign: "right",
              fontSize: "10px",
            }}
          >
            EZ Mapper by Danh
          </div>
        </div>
        <Background />
        <MiniMap />
      </ReactFlow>
    </>
  );
}

export default Flow;
