import { useLayoutEffect, useEffect, useRef, useState, memo } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import useStore from "../store";
import DragIcon from "./DragIcon";
import WidgetToolbar from "../components/WidgetToolbar";

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

    // Add canvas click handler to unselect the node
    const handleCanvasClick = (event: MouseEvent) => {
      // Only unselect if we're clicking directly on the canvas/pane
      // and not on a node or other UI element
      const target = event.target as HTMLElement;
      if (target.classList.contains('react-flow__pane')) {
        setSelectedNodeId(null);
      }
    };

    const inputElement = inputRef.current;
    inputElement?.addEventListener("keydown", handleKeyDown);
    
    // Add event listener to the document or canvas
    document.addEventListener('click', handleCanvasClick);

    return () => {
      inputElement?.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener('click', handleCanvasClick);
    };
  }, [setSelectedNodeId]);

  const selected = selectedNodeId === id;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedNodeId(id);
      }}
      style={{ 
        backgroundColor: data.color,
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

      {/* Toolbar with Delete Button */}
      {(selected || isHovered) && (
        <WidgetToolbar id={id} onDelete={deleteNode} />
      )}

      {/* Add multiple handles for dynamic connection calculation */}
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
        style={{ backgroundColor: data.color }}
        isConnectable={true}
        id="top"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ backgroundColor: data.color }}
        isConnectable={true}
        id="bottom"
      />
      <Handle
        type="source"
        position={Position.Left}
        style={{ backgroundColor: data.color }}
        isConnectable={true}
        id="left"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ backgroundColor: data.color }}
        isConnectable={true}
        id="right"
      />
    </div>
  );
}

export default memo(FlowNode);
