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
      style={{ backgroundColor: "white" }}
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
             M2,50
             A50,10 0 0,0 98,50
             A50,10 0 0,0 2,50
             L2,75
             A50,10,0 0,0 98,75
             L98,50             
             "
          style={{ stroke: "black", backgroundColor: "transparent" }}
        />
      </svg>
      <Handle type="target" position={Position.Bottom} />
      <Handle
        type="source"
        position={Position.Top}
        style={{ backgroundColor: "transparent" }}
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
