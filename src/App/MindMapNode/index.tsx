import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import useStore from "../store";
import DragIcon from "./DragIcon";

export type NodeData = {
  label: string;
  sourcePosition?: Position;
  color?: string;
};

function MindMapNode({ id, data }: NodeProps<NodeData>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const deleteNode = useStore((state) => state.deleteNode);
  const setSelectedNodeId = useStore((state) => state.setSelectedNodeId);

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

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setSelectedNodeId(id)}
      style={{ backgroundColor: data.color }}
    >
      <div className="inputWrapper">
        <div className="dragHandle">
          <DragIcon />
          {isHovered && (
            <div>
              <button
                style={{
                  position: "absolute",
                  borderRadius: "50%",
                  backgroundColor: "pink",
                  border: "0px",
                  right: -17,
                  bottom: -15,
                }}
                onClick={() => deleteNode(id)}
              >
                -
              </button>
            </div>
          )}
        </div>
        <input
          value={data.label}
          onChange={(evt) => updateNodeLabel(id, evt.target.value)}
          className="input"
          ref={inputRef}
        />
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle
        type="source"
        position={Position.Top}
        style={{ backgroundColor: data.color }}
      />
    </div>
  );
}

export default MindMapNode;
