import { memo } from "react";
import { NodeProps, Position, NodeResizeControl } from "reactflow";
import useStore from "../store";
import DragIcon from "./DragIcon";
import WidgetToolbar from "../components/WidgetToolbar";

export type NodeData = {
  label: string;
  sourcePosition?: Position;
  color?: string;
};

const controlStyle = {
  background: "transparent",
  // border: "none",
};

function ResizeIcon() {
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
      style={{ position: "absolute", right: 2, bottom: 2 }}
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
          <WidgetToolbar id={id} onDelete={deleteNode} />
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
