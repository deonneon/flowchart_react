import { NodeProps } from "reactflow";

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
      Click to add node
    </div>
  );
}

export default ShadowNode;
