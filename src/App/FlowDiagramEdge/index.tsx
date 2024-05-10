import { BaseEdge, EdgeProps, getSmoothStepPath } from "reactflow";

function FlowDiagramEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY } = props;

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY: sourceY + 18,
    targetX,
    targetY,
    borderRadius: 20,
  });

  return <BaseEdge path={edgePath} markerEnd="url(#arrow)" {...props} />;
}

export default FlowDiagramEdge;
