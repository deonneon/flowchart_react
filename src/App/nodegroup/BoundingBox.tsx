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
      width="15"
      height="15"
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

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="black"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M5 7l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -14" />
      <path d="M9 7v-3h6v3" />
    </svg>
  );
}

const BoundingBoxNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const deleteNode = useStore((state) => state.deleteNode);
  const setSelectedNodeId = useStore((state) => state.setSelectedNodeId);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minWidth: "100px",
        minHeight: "50px",
        cursor: "default",
        position: "relative",
      }}
      onClick={() => setSelectedNodeId(id)}
    >
      {/* Drag Handle */}
      <div className="inputWrapper" style={{ cursor: "grab", position: "relative" }}>
        <div className="dragHandle">
          <DragIcon />
        </div>

        {/* Toolbar with Delete Button */}
        {selected && (
          <div
            style={{
              position: "absolute",
              top: "-30px",
              // left: "50%",
              // transform: "translateX(-50%)",
              display: "flex",
              // gap: "5px",
              background: "rgba(255, 255, 255, 0.8)",
              padding: "1px",
              borderRadius: "4px",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
              pointerEvents: "auto", // Allows clicking inside the toolbar
              zIndex: 10, // Ensures it's above other elements
            }}
            onMouseDown={(event) => event.stopPropagation()} // Prevent losing selection
          >
            <button
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
              onClick={(event) => {

                deleteNode(id);
              }}
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </div>

      {/* Resize Control */}
      {selected && (
        <NodeResizeControl style={controlStyle} minWidth={100} minHeight={50}>
          <ResizeIcon />
        </NodeResizeControl>
      )}
    </div>
  );
};

export default memo(BoundingBoxNode);
