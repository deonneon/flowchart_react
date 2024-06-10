import { useCallback, useEffect } from "react";
import {
  useStore as useReactFlowStore,
  getSmoothStepPath,
  getStraightPath,
  getSimpleBezierPath,
} from "reactflow";
import useStore from "../store";
import { getEdgeParams, NodeInternals } from "../utils";

interface SimpleFloatingEdgeProps {
  id: string;
  source: string;
  target: string;
  style?: React.CSSProperties;
}

function SimpleFloatingEdge({
  id,
  source,
  target,
  style,
}: SimpleFloatingEdgeProps) {
  const sourceNode = useReactFlowStore(
    useCallback((store) => store.nodeInternals.get(source), [source])
  ) as NodeInternals | undefined;
  const targetNode = useReactFlowStore(
    useCallback((store) => store.nodeInternals.get(target), [target])
  ) as NodeInternals | undefined;

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { edgePathType, diagramType, toggleEdgeStyle, deleteEdge } = useStore(
    (state) => ({
      edgePathType: state.edgePathType,
      diagramType: state.diagramType,
      toggleEdgeStyle: state.toggleEdgeStyle,
      deleteEdge: state.deleteEdge,
    })
  );

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(
    sourceNode as NodeInternals,
    targetNode as NodeInternals
  );

  const getEdgePath = () => {
    switch (edgePathType) {
      case "smooth":
        return getSmoothStepPath({
          sourceX: sx,
          sourceY: sy,
          sourcePosition: sourcePos,
          targetPosition: targetPos,
          targetX: tx,
          targetY: ty,
        })[0];
      case "straight":
        return getStraightPath({
          sourceX: sx,
          sourceY: sy,
          targetX: tx,
          targetY: ty,
        })[0];
      case "bezier":
        return getSimpleBezierPath({
          sourceX: sx,
          sourceY: sy,
          sourcePosition: sourcePos,
          targetPosition: targetPos,
          targetX: tx,
          targetY: ty,
        })[0];
      default:
        return getStraightPath({
          sourceX: sx,
          sourceY: sy,
          targetX: tx,
          targetY: ty,
        })[0];
    }
  };

  const edgePath = getEdgePath();

  const handleEdgeClick = useCallback(() => {
    toggleEdgeStyle(id);
  }, [toggleEdgeStyle, id]);

  const handleKeyPress = useCallback(
    (event: any) => {
      if (event.key === "Delete") {
        deleteEdge(id);
      }
    },
    [deleteEdge, id]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const markerEnd = diagramType === "flow" ? "url(#arrow)" : undefined;

  return (
    <g onClick={handleEdgeClick}>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
    </g>
  );
}

export default SimpleFloatingEdge;
