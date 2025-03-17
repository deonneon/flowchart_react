import { useEffect, useRef, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import useStore from "../store";
import DragIcon from "./DragIcon";
import BoyIcon from "@mui/icons-material/Boy";
import WidgetToolbar from "../components/WidgetToolbar";

export type NodeData = {
  label: string;
  sourcePosition?: Position;
  color?: string;
};

const PeopleNode = ({ id, data }: NodeProps<NodeData>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const deleteNode = useStore((state) => state.deleteNode);
  const setSelectedNodeId = useStore((state) => state.setSelectedNodeId);
  const selectedNodeId = useStore((state) => state.selectedNodeId);

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
      inputRef.current?.select();
    }, 1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && inputRef.current) {
        inputRef.current.blur();
      }
    };

    const inputElement = inputRef.current;
    inputElement?.addEventListener("keydown", handleKeyDown);

    return () => {
      inputElement?.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selected = selectedNodeId === id;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setSelectedNodeId(id)}
      style={{
        borderRadius: "5px",
        display: "flex",
        flexDirection: "column",
        // alignItems: "center",
      }}
    >
      {/* Toolbar with Delete Button */}
      {(selected || isHovered) && (
        <WidgetToolbar id={id} onDelete={deleteNode} />
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="inputWrapper">
          <div className="dragHandle">
            <DragIcon />
          </div>
          <input
            value={data.label}
            onChange={(evt) => updateNodeLabel(id, evt.target.value)}
            className="input"
            ref={inputRef}
            style={{
              textAlign: "center",
              marginBottom: "5px",
              border: "none",
              fontWeight: "bold",
              width: "100%",
            }}
          />
        </div>
        <BoyIcon fontSize="large" sx={{ color: data.color || "black" }} />
      </div>
      <Handle type="target" position={Position.Top} isConnectable={true} />
      <Handle
        type="source"
        position={Position.Top}
        style={{ backgroundColor: "transparent" }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ backgroundColor: "transparent" }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Left}
        style={{ backgroundColor: "transparent" }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ backgroundColor: "transparent" }}
        isConnectable={true}
      />
    </div>
  );
};

export default PeopleNode;
