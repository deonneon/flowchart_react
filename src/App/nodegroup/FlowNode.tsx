import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import useStore from "../store";
import DragIcon from "./DragIcon";

export type NodeData = {
  label: string;
  sourcePosition?: Position;
  color?: string;
};

function FlowNode({ id, data }: NodeProps<NodeData>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNodeLabel = useStore((state) => state.updateNodeLabel);
  const deleteNode = useStore((state) => state.deleteNode);
  const setSelectedNodeId = useStore((state) => state.setSelectedNodeId);

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 1);
  }, []);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.width = `${data.label.length * 8}px`;
    }
  }, [data.label.length]);

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
      <Handle type="target" position={Position.Left} />
      <Handle
        type="source"
        position={Position.Top}
        style={{ backgroundColor: data.color }}
      />
    </div>
  );
}

export default FlowNode;
