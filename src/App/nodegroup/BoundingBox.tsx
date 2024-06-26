import { memo } from "react";
import { NodeProps, Position, NodeResizeControl } from "reactflow";
import useStore from "../store";
import DragIcon from "./DragIcon";

export type NodeData = {
  label: string;
  sourcePosition?: Position;
  color?: string;
};

const controlStyle = {
  background: "transparent",
  border: "none",
};

function ResizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="black"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: "absolute", right: 5, bottom: 5 }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <polyline points="16 20 20 20 20 16" />
      <line x1="14" y1="14" x2="20" y2="20" />
      <polyline points="8 4 4 4 4 8" />
      <line x1="4" y1="4" x2="10" y2="10" />
    </svg>
  );
}

const BoundingBoxNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const deleteNode = useStore((state) => state.deleteNode);
  const setSelectedNodeId = useStore((state) => state.setSelectedNodeId);

  return (
    <div
      style={{
        padding: "5px",
        width: "100%",
        height: "100%",
        cursor: "default",
        position: "relative", // Add relative positioning to the container
      }}
      onClick={() => setSelectedNodeId(id)}
    >
      <div className="inputWrapper" style={{ cursor: "grab" }}>
        <div className="dragHandle">
          <DragIcon />
        </div>
      </div>
      {selected && (
        <NodeResizeControl style={controlStyle} minWidth={100} minHeight={50}>
          <ResizeIcon />
          <button
            style={{
              position: "absolute",
              borderRadius: "50%",
              backgroundColor: "pink",
              border: "0px",
              right: -10,
              bottom: -10,
            }}
            onClick={() => deleteNode(id)}
          >
            -
          </button>
        </NodeResizeControl>
      )}
      <div
        style={{
          padding: 10,
          minHeight: 40,
          minWidth: 100,
        }}
      ></div>
    </div>
  );
};

export default memo(BoundingBoxNode);
