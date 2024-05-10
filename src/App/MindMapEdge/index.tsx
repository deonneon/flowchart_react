import React from "react";
import {
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  getStraightPath,
  getSimpleBezierPath,
} from "reactflow";
import useStore from "../store";

function MindMapEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY } = props;
  const { edgePathType, diagramType } = useStore((state) => ({
    edgePathType: state.edgePathType,
    diagramType: state.diagramType,
  }));

  const getEdgePath = () => {
    switch (edgePathType) {
      case "smooth":
        return getSmoothStepPath({
          sourceX,
          sourceY: sourceY + 18,
          targetX,
          targetY,
        })[0];
      case "straight":
        return getStraightPath({
          sourceX,
          sourceY: sourceY + 18,
          targetX,
          targetY,
        })[0];
      case "bezier":
        return getSimpleBezierPath({
          sourceX,
          sourceY: sourceY + 18,
          targetX,
          targetY,
        })[0];
      default:
        return getStraightPath({
          sourceX,
          sourceY,
          targetX,
          targetY,
        })[0];
    }
  };

  const markerEnd = diagramType === "flow" ? "url(#arrow)" : undefined;

  const edgePath = getEdgePath();

  return <BaseEdge path={edgePath} {...props} markerEnd={markerEnd} />;
}

export default MindMapEdge;
