import { useCallback, useRef, useEffect } from "react";
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
} from "reactflow";
import shallow from "zustand/shallow";

import useStore, { RFState } from "./store";
import MindMapNode from "./MindMapNode";
import MindMapEdge from "./MindMapEdge";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// we need to import the React Flow styles to make it work
import "reactflow/dist/style.css";

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
  const { nodes, edges, onNodesChange, onEdgesChange, addChildNode } = useStore(
    selector,
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
    // we need to remember where the connection started so we can add the new node to the correct parent on connect end
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

  return (
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
      <Controls showInteractive={false} />
      <Panel position="top-left" className="header">
        React Flow Mind Map
        <br></br>
        <button onClick={saveToJson}>Save Mind Map</button>
        <input
          type="file"
          style={{ marginLeft: "10px" }}
          onChange={handleUploadJson}
          accept=".json"
        />
        <div style={{ marginTop: "2px" }}>
          Line type -
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
          <button onClick={() => useStore.setState({ edgePathType: "bezier" })}>
            Curly
          </button>
        </div>
        <button onClick={saveToLocal}>Save</button>
        <button onClick={loadFromLocal} style={{ marginLeft: "10px" }}>
          Restore
        </button>
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
    </ReactFlow>
  );
}

export default Flow;
