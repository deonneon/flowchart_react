import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import useStore from "../store";
import DragIcon from "./DragIcon";

export type NodeData = {
  label: string;
  sourcePosition?: Position;
  color?: string;
};

function DatabaseNode({ id, data }: NodeProps<NodeData>) {
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
      style={{
        backgroundColor: "transparent",
      }}
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 100 100"
        className="database-shape"
      >
        <path
          d="
            M2,20
            A50,10 0 0,0 98,20
            A50,10 0 0,0 2,20
            L2,60 
            A50,10,0 0,0 98,60
            L98,20             
          "
          style={{ stroke: "black", fill: data.color || "salmon" }}
        />
      </svg>
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
      {isHovered && (
        <div>
          <button
            style={{
              position: "absolute",
              borderRadius: "50%",
              backgroundColor: "pink",
              border: "0px",
              right: 0,
              bottom: 0,
            }}
            onClick={() => deleteNode(id)}
          >
            -
          </button>
        </div>
      )}
    </div>
  );
}

export default DatabaseNode;
