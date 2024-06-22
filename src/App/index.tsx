import { useCallback, useRef, useEffect, useState } from "react";
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
  NodeMouseHandler,
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
import PeopleNode from "./nodegroup/PeopleNode";
import SimpleFloatingEdge from "./edgegroup/FloatingEdge";

import MenuModal from "./components/MenuModal";
import MenuIcon from "@mui/icons-material/Menu";
import ShadowNode from "./nodegroup/ShadowNode";

const nodeTypes = {
  mindmap: MindMapNode,
  shadow: ShadowNode,
  textbox: TextBoxNode,
  boundingbox: BoundingBoxNode,
  database: DatabaseNode,
  flowmap: FlowNode,
  people: PeopleNode,
};

const edgeTypes = {
  mindmap: MindMapEdge,
  flowmap: SimpleFloatingEdge,
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
    addShadowNode,
    convertShadowNode,
    setSelectedNodeId,
    diagramType,
    selectedNodeId,
    deleteNode,
    addEdge,
    showShadowNodes,
    toggleShowShadowNodes,
  } = useStore(
    (state) => ({
      nodes: state.nodes,
      edges: state.edges,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      addChildNode: state.addChildNode,
      addShadowNode: state.addShadowNode,
      convertShadowNode: state.convertShadowNode,
      diagramType: state.diagramType,
      setDiagramType: state.setDiagramType,
      setSelectedNodeId: state.setSelectedNodeId,
      selectedNodeId: state.selectedNodeId,
      deleteNode: state.deleteNode,
      addEdge: state.addEdge,
      showShadowNodes: state.showShadowNodes,
      toggleShowShadowNodes: state.toggleShowShadowNodes,
    }),
    shallow
  );
  const { project, setCenter } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);

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
  const defaultEdgeOptions = {
    style: connectionLineStyle,
    type: diagramType === "mindmap" ? "mindmap" : "flowmap",
  };

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
      const { nodeInternals } = store.getState();
      const parentNode = connectingNodeId.current
        ? nodeInternals.get(connectingNodeId.current)
        : null;

      if (
        (event.target as Element).classList.contains("react-flow__pane") &&
        parentNode
      ) {
        const childNodePosition = getChildNodePosition(
          event as MouseEvent,
          parentNode
        );
        if (childNodePosition) {
          const newNodeId = addChildNode(parentNode, childNodePosition);
          if (showShadowNodes) {
            // Check if shadow nodes should be added
            const shadowPosition = {
              x: childNodePosition.x + 20,
              y: childNodePosition.y,
            };
            addShadowNode(newNodeId, shadowPosition);
          }
        }
      }
      connectingNodeId.current = null;
    },
    [getChildNodePosition, addChildNode, addShadowNode, showShadowNodes] // Add showShadowNodes as a dependency
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (node.type === "shadow" && showShadowNodes) {
        // Check if shadow nodes should be converted
        convertShadowNode(node.id);
      }
    },
    [convertShadowNode, showShadowNodes] // Add showShadowNodes as a dependency
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
      const isCopy = (event.ctrlKey || event.metaKey) && event.key === "c";
      const isPaste = (event.ctrlKey || event.metaKey) && event.key === "v";

      if (event.key === "Delete" && selectedNodeId) {
        deleteNode(selectedNodeId);
      } else if (isCopy && selectedNodeId) {
        event.preventDefault();
        useStore.setState({ copiedNodeId: selectedNodeId });
      } else if (isPaste) {
        event.preventDefault();
        useStore.getState().cloneNode();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [deleteNode, selectedNodeId]);

  const addPeopleNode = () => {
    const position = { x: Math.random() * 200, y: Math.random() * 150 };
    const newNode = {
      id: nanoid(), // Generates a unique ID
      type: "people",
      data: { label: "Person" },
      position,
      dragHandle: ".dragHandle",
    };

    useStore.setState((prevState) => ({
      nodes: [...prevState.nodes, newNode],
    }));
    setSelectedNodeId(newNode.id);
    toast("Added new person node!");
  };

  const [isModalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnectStart={onConnectStart}
      onConnectEnd={onConnectEnd}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodeOrigin={nodeOrigin}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineStyle={connectionLineStyle}
      fitView
    >
      <MenuModal
        open={isModalOpen}
        handleClose={handleCloseModal}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showShadowNodes={showShadowNodes}
        toggleShowShadowNodes={toggleShowShadowNodes}
      />
      <Controls />
      <Panel
        position="top-left"
        className="header"
        style={{ display: "flex", alignItems: "center" }}
      >
        <ToastContainer
          position="top-right"
          style={{
            marginTop: "40px",
            width: "13%",
            fontSize: "0.7rem",
            zIndex: 1000,
          }}
          autoClose={2000}
          hideProgressBar={true}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Button
          onClick={handleOpenModal}
          title="Show Instructions"
          style={{
            marginRight: "5px",
          }}
          variant="outlined"
        >
          <MenuIcon />
        </Button>
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
            <Button
              style={{ marginLeft: "5px" }}
              variant="contained"
              onClick={addPeopleNode}
              title="Add People Node"
            >
              Add Person
            </Button>
          </>
        )}
      </Panel>
      <BottomToolbar />
      <DiagramTypeSwitcher nodes={nodes} setCenter={setCenter} />
      {showGrid && <Background />}
      <MiniMap />
      <svg id="defs" style={{ width: 0, height: 0, position: "absolute" }}>
        <defs>
          <marker
            id="arrow"
            markerWidth="10" // increased width
            markerHeight="10" // increased height
            refX="6" // offset the arrow head
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
            viewBox="0 0 10 10"
          >
            <path d="M0,0 L0,6 L9,3 z" fill="#333" />
          </marker>
        </defs>
      </svg>
    </ReactFlow>
  );
}

export default Flow;
