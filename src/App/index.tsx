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

import useStore from "./store";
import MindMapNode from "./MindMapNode";
import MindMapEdge from "./MindMapEdge";
import TextBoxNode from "./nodegroup/Textbox";
import BoundingBoxNode from "./nodegroup/BoundingBox";
import DatabaseNode from "./nodegroup/Database";

import "react-toastify/dist/ReactToastify.css";

// we need to import the React Flow styles to make it work
import "reactflow/dist/style.css";

import DiagramTypeSwitcher from "./components/DiagramSwitcher";
import BottomToolbar from "./components/BottomToolbar";
import FlowNode from "./nodegroup/FlowNode";
import PeopleNode from "./nodegroup/PeopleNode";
import SimpleFloatingEdge from "./edgegroup/FloatingEdge";

import ShadowNode from "./nodegroup/ShadowNode";
import TopRightPanel from "./components/TopRightPanel";
import SvgDefinitions from "./components/SvgDefinitions";

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

const nodeOrigin: NodeOrigin = [0, 0];

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
    showShadowNodes,
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
      showShadowNodes: state.showShadowNodes,
    }),
    shallow
  );
  const { project, setCenter } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    if (diagramType === "mindmap") {
      setSelectedNodeId("mindmap-root");
      setCenter(0, 0);
    } else if (diagramType === "flow") {
      setSelectedNodeId("flow-root");
      setCenter(200, 0);
    }
  }, [diagramType, setSelectedNodeId, setCenter]);

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
    [getChildNodePosition, addChildNode, addShadowNode, showShadowNodes]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (node.type === "shadow" && showShadowNodes) {
        convertShadowNode(node.id);
      }
    },
    [convertShadowNode, showShadowNodes]
  );

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
      // fitView
    >
      <Controls />
      <Panel
        position="top-left"
        className="header"
        style={{ display: "flex", alignItems: "center" }}
      >
        <TopRightPanel showGrid={showGrid} setShowGrid={setShowGrid} />
      </Panel>
      <BottomToolbar />
      <DiagramTypeSwitcher nodes={nodes} setCenter={setCenter} />
      {showGrid && <Background />}
      <MiniMap />
      <SvgDefinitions />
    </ReactFlow>
  );
}

export default Flow;
