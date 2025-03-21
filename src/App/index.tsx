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
  Connection,
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
import Sidebar from "./components/Sidebar";
import CheckpointPanel from "./components/CheckpointPanel";

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
    addEdge,
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
      addEdge: state.addEdge,
    }),
    shallow
  );
  const { screenToFlowPosition, setCenter } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);
  const lastConnectionTimestamp = useRef<number>(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showCheckpoints, setShowCheckpoints] = useState(false);

  // Load checkpoints from localStorage on component mount
  useEffect(() => {
    const loadCheckpointsFromStorage = () => {
      const checkpointKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("flowchart_checkpoint_")
      );

      if (checkpointKeys.length > 0) {
        const loadedCheckpoints = checkpointKeys.map((key) => {
          const id = key.replace("flowchart_checkpoint_", "");
          let name = `Checkpoint ${id.substring(0, 4)}`;
          let timestamp = Date.now();
          let preview: string | undefined;

          // Try to load full checkpoint data
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);

              // Extract metadata
              if (parsed.name) name = parsed.name;
              if (parsed.timestamp) timestamp = parsed.timestamp;
              if (parsed.preview) preview = parsed.preview;
            }
          } catch (error) {
            console.error("Error loading checkpoint data:", error);
          }

          return {
            id,
            name,
            timestamp,
            preview,
          };
        });

        // Sort by most recent first and update state
        loadedCheckpoints.sort((a, b) => b.timestamp - a.timestamp);
        useStore.setState({ checkpoints: loadedCheckpoints });
      }
    };

    loadCheckpointsFromStorage();
  }, []);

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
    const panePosition = screenToFlowPosition({
      x: event.clientX - left,
      y: event.clientY - top,
    });

    return {
      x:
        panePosition.x -
        parentNode.positionAbsolute.x +
        parentNode.width / 2 -
        parentNode.width,
      y:
        panePosition.y -
        parentNode.positionAbsolute.y +
        parentNode.height / 2 -
        parentNode.height,
    };
  };

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        // Record the time when a connection was made
        lastConnectionTimestamp.current = Date.now();
        addEdge(connection.source, connection.target);
      }
    },
    [addEdge]
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Check if a connection was made within the last 300ms
      const connectionJustMade =
        Date.now() - lastConnectionTimestamp.current < 300;

      // If we just made a connection, don't create a node
      if (connectionJustMade) {
        connectingNodeId.current = null;
        return;
      }

      const { nodeInternals } = store.getState();
      const parentNode = connectingNodeId.current
        ? nodeInternals.get(connectingNodeId.current)
        : null;

      // Only proceed if we're connecting to the pane and have a valid parent node
      if (
        (event.target as Element).classList.contains("react-flow__pane") &&
        parentNode
      ) {
        const childNodePosition = getChildNodePosition(
          event as MouseEvent,
          parentNode
        );
        if (childNodePosition) {
          // Add the child node
          const newNodeId = addChildNode(parentNode, childNodePosition);

          // Only add shadow node if shadow nodes are enabled
          if (showShadowNodes) {
            // Calculate the vector from parent to child using the childNodePosition
            // since this is the relative position of the child to its parent
            const vectorX = childNodePosition.x;
            const vectorY = childNodePosition.y;

            // Normalize the vector
            const magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);

            // Avoid division by zero
            if (magnitude > 0) {
              const normalizedX = vectorX / magnitude;
              const normalizedY = vectorY / magnitude;

              // Project the vector to determine shadow node position
              // Use the same distance as the current fixed offset (width + 30)
              const distance = parentNode?.width ? parentNode.width - 30 : 40;

              const shadowPosition = {
                x: distance * normalizedX,
                y: distance * normalizedY,
              };

              // Add the shadow node after a short delay to ensure it's not immediately removed
              setTimeout(() => {
                addShadowNode(newNodeId, shadowPosition);
              }, 50);
            } else {
              // Fallback to the original behavior if the magnitude is zero
              const shadowPosition = {
                x: parentNode?.width ? parentNode.width + 30 : 100,
                y: 0,
              };

              // Add the shadow node after a short delay
              setTimeout(() => {
                addShadowNode(newNodeId, shadowPosition);
              }, 50);
            }
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
      } else {
        // Set the selected node ID, which will remove shadow nodes
        setSelectedNodeId(node.id);
      }
    },
    [convertShadowNode, showShadowNodes, setSelectedNodeId]
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

  const toggleCheckpoints = () => {
    setShowCheckpoints(!showCheckpoints);
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
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodeOrigin={nodeOrigin}
      snapToGrid={true}
      snapGrid={[1, 1]}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineStyle={connectionLineStyle}
      // fitView
    >
      <Sidebar />
      {showCheckpoints && <CheckpointPanel />}
      <Controls />
      <Panel
        position="top-left"
        className="header"
        style={{ display: "flex", alignItems: "center" }}
      >
        <TopRightPanel
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          showCheckpoints={showCheckpoints}
          toggleCheckpoints={toggleCheckpoints}
        />
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
