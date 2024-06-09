import React, { useCallback } from "react";
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  getStraightPath,
  getSimpleBezierPath,
} from "reactflow";
import useStore from "../store";

function MindMapEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY } = props;
  const { edgePathType, diagramType, deleteEdge } = useStore((state) => ({
    edgePathType: state.edgePathType,
    diagramType: state.diagramType,
    deleteEdge: state.deleteEdge,
  }));

  const getEdgePath = () => {
    switch (edgePathType) {
      case "smooth":
        return getSmoothStepPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
        })[0];
      case "straight":
        return getStraightPath({
          sourceX,
          sourceY: sourceY + 5,
          targetX,
          targetY,
        })[0];
      case "bezier":
        return getSimpleBezierPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
        })[0];
      default:
        return getStraightPath({
          sourceX,
          sourceY: sourceY + 5,
          targetX,
          targetY,
        })[0];
    }
  };

  const handleEdgeClick = useCallback(() => {
    deleteEdge(id);
  }, [deleteEdge, id]);

  const edgePath = getEdgePath();
  const markerEnd = diagramType === "flow" ? "url(#arrow)" : undefined;

  return (
    <g onClick={handleEdgeClick}>
      <BaseEdge path={edgePath} markerEnd={markerEnd} {...props} />
    </g>
  );
}

export default MindMapEdge;
