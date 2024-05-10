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
  const edgePathType = useStore((state) => state.edgePathType);

  const getEdgePath = () => {
    switch (edgePathType) {
      case "smooth":
        return getSmoothStepPath({
          sourceX,
          sourceY: sourceY + 18, // Adjust if necessary
          targetX,
          targetY,
        })[0]; // Ensure to use only the path string
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

  const edgePath = getEdgePath(); // Ensuring this calls the function correctly

  return <BaseEdge path={edgePath} {...props} />;
}

export default MindMapEdge;
