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

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// we need to import the React Flow styles to make it work
import "reactflow/dist/style.css";

import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import RestoreIcon from "@mui/icons-material/Restore";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

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
  } = useStore(
    (state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      addChildNode: state.addChildNode,
      diagramType: state.diagramType,
      setDiagramType: state.setDiagramType,
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
    (event) => {
      const { nodeInternals } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        "react-flow__pane"
      );
      const node = (event.target as Element).closest(".react-flow__node");

      if (node) {
        node.querySelector("input")?.focus({ preventScroll: true });
      } else if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(event, parentNode);

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
    // Here you can adjust the initial position and other properties of the new node
    const position = { x: Math.random() * 400, y: Math.random() * 400 };
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
    toast("Added new node!");
  };

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
          EZ Flows by Danh
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
          }}
        >
          <button onClick={saveToJson} title="Download as JSON">
            <DownloadIcon />
          </button>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleUploadJson}
            accept=".json"
          />
          <label
            htmlFor="fileInput"
            style={{
              cursor: "pointer",
              border: "1px solid gray",
              padding: "1px 9px",
            }}
            title="Load JSON"
          >
            <UploadFileIcon />
          </label>
          <button onClick={saveToLocal} title="Save Mind Map">
            Save
          </button>
          <button onClick={loadFromLocal} title="Restore">
            Restore
          </button>
          <button onClick={addEmptyNode} title="Add Empty Node">
            Add Node
          </button>
          <div style={{ marginTop: "2px" }}>
            <span>Line type </span>
            <button
              style={{ marginRight: "5px" }}
              onClick={() => useStore.setState({ edgePathType: "smooth" })}
            >
              Step
            </button>
            <button
              style={{ marginRight: "5px" }}
              onClick={() => useStore.setState({ edgePathType: "straight" })}
            >
              Straight
            </button>
            <button
              onClick={() => useStore.setState({ edgePathType: "bezier" })}
            >
              Curly
            </button>
          </div>
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
                  diagramType === "flow" ? "#FFA500" : "lightgray",
                color: "white",
                padding: "10px 20px",
                border: "0px",
                borderRight: "none",
              }}
              onClick={() => setDiagramType("flow")}
            >
              Flow Diagram
            </button>
            <button
              style={{
                backgroundColor:
                  diagramType === "mindmap" ? "#FFA500" : "lightgray",
                color: "white",
                border: "0px",
                padding: "10px 20px",
              }}
              onClick={() => setDiagramType("mindmap")}
            >
              Mind Map
            </button>
          </div>
        </div>
        <Background />
        <MiniMap />
      </ReactFlow>
    </>
  );
}

export default Flow;
