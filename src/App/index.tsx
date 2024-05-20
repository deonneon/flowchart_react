import { useCallback, useRef } from "react";
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
import { Button } from "@mui/material";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// we need to import the React Flow styles to make it work
import "reactflow/dist/style.css";

import DownloadButton from "./components/DownloadButton";
import DiagramTypeSwitcher from "./components/DiagramSwitcher";
import BottomToolbar from "./components/BottomToolbar";

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
  const { project, setCenter } = useReactFlow();
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
        <BottomToolbar />
        <DiagramTypeSwitcher nodes={nodes} setCenter={setCenter} />
        <Background />
        <MiniMap />
      </ReactFlow>
    </>
  );
}

export default Flow;
