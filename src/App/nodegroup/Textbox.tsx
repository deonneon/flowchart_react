import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import useStore from "../store";
import DragIcon from "./DragIcon";
import WidgetToolbar from "../components/WidgetToolbar";

export type NodeData = {
  label: string;
  sourcePosition?: Position;
  color?: string;
};

const TextBoxNode = ({ id, data }: NodeProps<NodeData>) => {
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

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.width = `${data.label.length * 8}px`;
    }
  }, [data.label.length]);

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
      style={{
        padding: "5px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setSelectedNodeId(id)}
    >
      <div className="inputWrapper">
        <div className="dragHandle">
          <DragIcon />
        </div>
        <input
          value={data.label}
          onChange={(evt) => updateNodeLabel(id, evt.target.value)}
          className="input"
          ref={inputRef}
        />
      </div>

      {/* Toolbar with Delete Button */}
      {(selected || isHovered) && (
        <WidgetToolbar id={id} onDelete={deleteNode} />
      )}

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={true}
        id="top"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        isConnectable={true}
        id="bottom"
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={true}
        id="left"
      />
      <Handle
        type="target"
        position={Position.Right}
        isConnectable={true}
        id="right"
      />
      <Handle
        type="source"
        position={Position.Top}
        className="textbox-node"
        style={{ backgroundColor: data.color }}
        isConnectable={true}
        id="top"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="textbox-node"
        style={{ backgroundColor: data.color }}
        isConnectable={true}
        id="bottom"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="textbox-node"
        style={{ backgroundColor: data.color }}
        isConnectable={true}
        id="left"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="textbox-node"
        style={{ backgroundColor: data.color }}
        isConnectable={true}
        id="right"
      />
    </div>
  );
};

export default TextBoxNode;
