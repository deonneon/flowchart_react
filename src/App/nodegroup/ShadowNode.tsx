import { NodeProps, Handle, Position } from "reactflow";

function ShadowNode({ data }: NodeProps) {
  return (
    <div
      style={{
        padding: "10px",
        borderRadius: "3px",
        width: "150px",
        fontSize: "12px",
        color: "#888",
        textAlign: "center",
        backgroundColor: "rgba(240, 240, 240, 0.5)",
        border: "1px dashed #888",
        cursor: "pointer",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="shadow-target-top"
        style={{ visibility: "hidden" }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="shadow-target-bottom"
        style={{ visibility: "hidden" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="shadow-target-left"
        style={{ visibility: "hidden" }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="shadow-target-right"
        style={{ visibility: "hidden" }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="shadow-source-top"
        style={{ visibility: "hidden" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="shadow-source-bottom"
        style={{ visibility: "hidden" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="shadow-source-left"
        style={{ visibility: "hidden" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="shadow-source-right"
        style={{ visibility: "hidden" }}
      />
      Click to add node
    </div>
  );
}

export default ShadowNode;
