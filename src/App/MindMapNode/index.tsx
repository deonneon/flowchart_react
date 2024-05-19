import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Handle, NodeProps, Position, Node } from "reactflow";
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
  const updateNodeColor = useStore((state) => state.updateNodeColor);

  const [isHovered, setIsHovered] = useState(false);

  const cycleColors = (currentColor: string) => {
    const colors = ["yellow", "red", "green", "blue"];
    const currentIndex = colors.indexOf(currentColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    return colors[nextIndex];
  };

  const handleColorChange = () => {
    const currentColor = data.color || "yellow"; // default color if undefined
    updateNodeColor(id, cycleColors(currentColor));
  };

  const nextColor = cycleColors(data.color || "yellow");

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
              <button
                onClick={handleColorChange}
                style={{
                  position: "absolute",
                  right: -17,
                  top: -15,
                  width: 17,
                  height: 17,
                  border: "none",
                  borderRadius: "50%",
                  backgroundColor: nextColor, // Use the computed next color here
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 2,
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15 11.25 1.5 1.5.75-.75V8.758l2.276-.61a3 3 0 1 0-3.675-3.675l-.61 2.277H12l-.75.75 1.5 1.5M15 11.25l-8.47 8.47c-.34.34-.8.53-1.28.53s-.94.19-1.28.53l-.97.97-.75-.75.97-.97c.34-.34.53-.8.53-1.28s.19-.94.53-1.28L12.75 9M15 11.25 12.75 9"
                  />{" "}
                </svg>
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
